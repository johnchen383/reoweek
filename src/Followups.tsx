import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from './api/client'
import { downloadCsv, toCsv } from './utils/csv'
import { SURVEY_QUESTIONS } from './data/questions'
import tierRules from './data/followups.json'
import { FOLLOW_UP_STATUSES } from './types'
import type { FollowUp, FollowUpStatus, GameResponse } from './types'


const TIERS = ['hot', 'warm', 'cold', 'stale'] as const
type Tier = (typeof TIERS)[number]

const TIER_LABELS: Record<Tier, string> = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
  stale: 'Stale',
}

// Hover text for the filter chips, derived from the live rules so it can't
// drift from what the classifier actually does.
const TIER_TOOLTIPS: Record<Tier, string> = {
  hot: `Answered any of: ${tierRules.hot.join(' / ')}`,
  warm: `No hot answers, but answered any of: ${tierRules.warm.join(' / ')}`,
  cold: `No hot or warm answers, but answered any of: ${tierRules.cold.join(' / ')}`,
  stale: 'None of the hot, warm, or cold answers',
}

function PotatoChip({ tier }: { tier: Tier }) {
  return (
    <span className={`potato potato--${tier}`}>
      <span className="potato__dot" />
      {TIER_LABELS[tier]}
    </span>
  )
}

// Rule/answer comparison shrugs off case and whitespace drift; only real
// rewording breaks a match (and then the banner below calls it out).
function normalize(s: string) {
  return s.trim().toLowerCase()
}

/**
 * Highest tier any of the person's answers matches wins (hot > warm > cold);
 * nothing matched means stale. Rules live in src/data/followups.json.
 */
function tierOf(response: GameResponse): Tier {
  const answers = response.survey.flatMap((a) =>
    Array.isArray(a.answer) ? a.answer.map(normalize) : [normalize(String(a.answer))],
  )
  for (const tier of ['hot', 'warm', 'cold'] as const) {
    if (tierRules[tier].some((option) => answers.includes(normalize(option)))) return tier
  }
  return 'stale'
}

// Rule strings that no current question option produces can never match a new
// response — usually a sign questions.json was reworded after the rules were
// written. Surfaced as a warning on the page.
const ALL_OPTIONS = new Set(
  SURVEY_QUESTIONS.flatMap((q) => q.options ?? []).map(normalize),
)
const UNMATCHED_RULES = (['hot', 'warm', 'cold'] as const).flatMap((tier) =>
  tierRules[tier]
    .filter((rule) => !ALL_OPTIONS.has(normalize(rule)))
    .map((rule) => `${TIER_LABELS[tier]}: "${rule}"`),
)

/** The answer strings that earned this response its tier (all of them). */
function qualifiersOf(response: GameResponse, tier: Tier): string[] {
  if (tier === 'stale') return []
  const answers = response.survey.flatMap((a) =>
    Array.isArray(a.answer) ? a.answer : [String(a.answer)],
  )
  const rules = new Set(tierRules[tier].map(normalize))
  return [...new Set(answers.filter((v) => rules.has(normalize(v))))]
}

function answerFor(response: GameResponse, questionId: string): string {
  const entry = response.survey.find((a) => a.questionId === questionId)
  if (!entry) return ''
  return Array.isArray(entry.answer) ? entry.answer.join(', ') : String(entry.answer)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Option-based questions (beyond simple yes/no) decompose into one ✓ column
// per option; everything else non-scale (student, contact, …) folds into a
// compact Details cell. Name is its own column.
const OPTION_QUESTIONS = SURVEY_QUESTIONS.filter(
  (q) => (q.type === 'choice' || q.type === 'multichoice') && (q.options?.length ?? 0) > 2,
)
const DETAILS_QUESTIONS = SURVEY_QUESTIONS.filter(
  (q) => q.type !== 'scale' && q.id !== 'name' && !OPTION_QUESTIONS.includes(q),
)

/** Did this response tick this option on this question? */
function selectedIn(response: GameResponse, questionId: string, option: string) {
  const entry = response.survey.find((a) => a.questionId === questionId)
  if (!entry) return false
  const values = Array.isArray(entry.answer) ? entry.answer : [String(entry.answer)]
  return values.some((v) => normalize(v) === normalize(option))
}

// Fixed keys, or `opt:<questionId>:<option>` for a tick column.
type SortKey = 'time' | 'name' | 'potato' | 'status' | 'contactee' | string

interface SortState {
  key: SortKey
  dir: 1 | -1
}

function optSortKey(questionId: string, option: string) {
  return `opt:${questionId}:${option}`
}

function parseOptSortKey(key: string) {
  const rest = key.slice(4)
  const sep = rest.indexOf(':')
  return { questionId: rest.slice(0, sep), option: rest.slice(sep + 1) }
}

/**
 * /followups — the follow-up worksheet. Every completed survey, bucketed into
 * potato tiers by priority, with an editable (persisted) status, contactee,
 * and notes per person. Password-gated like /admin.
 */
export default function Followups() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [responses, setResponses] = useState<GameResponse[]>([])
  const [edits, setEdits] = useState<Record<string, FollowUp>>({})
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState>({ key: 'potato', dir: 1 })
  const [tierFilter, setTierFilter] = useState<Tier | null>(null)
  // Empty set = no status filtering (all statuses shown).
  const [statusFilters, setStatusFilters] = useState<Set<FollowUpStatus>>(new Set())

  function toggleStatusFilter(status: FollowUpStatus) {
    setStatusFilters((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      // Selecting every status is the same as no filter.
      return next.size === FOLLOW_UP_STATUSES.length ? new Set() : next
    })
  }
  const [compact, setCompact] = useState(() => {
    try {
      return localStorage.getItem('wib-followups-compact') === 'true'
    } catch {
      return false
    }
  })
  const [contactees, setContactees] = useState<string[]>([])
  const [newContactee, setNewContactee] = useState('')
  const [exportScope, setExportScope] = useState('')
  // The previous sorted order — each new sort starts from it, so ties keep
  // their arrangement from earlier sorts (multi-level sorting by clicking).
  const orderRef = useRef<string[]>([])

  function toggleCompact() {
    const next = !compact
    setCompact(next)
    try {
      localStorage.setItem('wib-followups-compact', String(next))
    } catch {
      // best effort
    }
  }

  const load = useCallback(async (pw: string) => {
    if (!pw) {
      setError('Enter the password')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [data, contacteeNames] = await Promise.all([
        api.listResponses(pw),
        api.listContactees(pw),
      ])
      setResponses(data)
      setEdits(Object.fromEntries(data.map((r) => [r.id, r.followUp])))
      setContactees(contacteeNames)
      setAuthed(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthed(false)
        setError('Incorrect password')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load responses')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  function handleUnlock(e: FormEvent) {
    e.preventDefault()
    load(password)
  }

  function setField(id: string, field: keyof FollowUp, value: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function save(id: string, followUp: FollowUp) {
    setSavingIds((prev) => new Set(prev).add(id))
    setError(null)
    try {
      const updated = await api.updateFollowUp(id, followUp, password)
      setResponses((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save follow-up')
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  async function addContactee(e: FormEvent) {
    e.preventDefault()
    const name = newContactee.trim()
    if (!name) return
    setError(null)
    try {
      await api.addContactee(name, password)
      setContactees((prev) => [...new Set([...prev, name])].sort((a, b) => a.localeCompare(b)))
      setNewContactee('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contactee')
    }
  }

  async function removeContactee(name: string) {
    setError(null)
    try {
      await api.deleteContactee(name, password)
      setContactees((prev) => prev.filter((c) => c !== name))
      if (exportScope === name) setExportScope('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove contactee')
    }
  }

  /** Text fields save on blur — only if something actually changed. */
  function saveIfChanged(response: GameResponse) {
    const edit = edits[response.id]
    if (!edit) return
    const saved = response.followUp
    if (
      edit.status !== saved.status ||
      edit.contactee !== saved.contactee ||
      edit.notes !== saved.notes
    ) {
      save(response.id, edit)
    }
  }

  // Contactees sign in with their own name (lowercase) instead of the admin
  // password. Their board is scoped to rows assigned to them, read-only on
  // assignment, with no export or contactee management.
  const viewerContactee = useMemo(() => {
    // Same rule as the server: name with spaces dropped, lowercased.
    const squash = (s: string) => s.replace(/\s+/g, '').toLowerCase()
    const wanted = squash(password)
    return (wanted && contactees.find((c) => squash(c) === wanted)) || null
  }, [contactees, password])

  const rows = useMemo(() => {
    const surveyed = responses.filter(
      (r) =>
        r.survey.length > 0 &&
        (!viewerContactee ||
          (edits[r.id]?.contactee ?? r.followUp.contactee) === viewerContactee),
    )
    // Seed from the previous sorted order; sort() is stable, so rows the
    // current key considers equal keep that order instead of resetting.
    const pos = new Map(orderRef.current.map((id, i) => [id, i]))
    surveyed.sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity))
    const withTier = surveyed.map((r) => ({ response: r, tier: tierOf(r) }))
    const dir = sort.dir
    const statusOrder = (s: FollowUpStatus) => FOLLOW_UP_STATUSES.indexOf(s)
    withTier.sort((a, b) => {
      // Tick columns: ticked rows first (on ascending).
      if (sort.key.startsWith('opt:')) {
        const { questionId, option } = parseOptSortKey(sort.key)
        const ta = selectedIn(a.response, questionId, option) ? 0 : 1
        const tb = selectedIn(b.response, questionId, option) ? 0 : 1
        return dir * (ta - tb)
      }
      switch (sort.key) {
        case 'potato':
          return dir * (TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier))
        case 'name':
          return (
            dir *
            answerFor(a.response, 'name')
              .toLowerCase()
              .localeCompare(answerFor(b.response, 'name').toLowerCase())
          )
        case 'status': {
          const ea = edits[a.response.id]?.status ?? a.response.followUp.status
          const eb = edits[b.response.id]?.status ?? b.response.followUp.status
          return dir * (statusOrder(ea) - statusOrder(eb))
        }
        case 'contactee': {
          const ca = (edits[a.response.id]?.contactee ?? '').toLowerCase()
          const cb = (edits[b.response.id]?.contactee ?? '').toLowerCase()
          // Empty contactees sort last regardless of direction.
          if (!ca && cb) return 1
          if (ca && !cb) return -1
          return dir * ca.localeCompare(cb)
        }
        case 'time':
        default:
          return (
            dir *
            ((a.response.surveyCompletedAt ?? '') < (b.response.surveyCompletedAt ?? '') ? -1 : 1)
          )
      }
    })
    orderRef.current = withTier.map((r) => r.response.id)
    return withTier
  }, [responses, edits, sort, viewerContactee])

  function toggleSort(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: 1 }))
  }

  function SortHeader({ label, sortKey }: { label: string; sortKey: SortKey }) {
    const active = sort.key === sortKey
    return (
      <th
        rowSpan={2}
        className={`followups__sortable${active ? ' followups__sortable--active' : ''}`}
        onClick={() => toggleSort(sortKey)}
        role="button"
        aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
      >
        {label} {active ? (sort.dir === 1 ? '▲' : '▼') : ''}
      </th>
    )
  }

  if (!authed) {
    return (
      <div className="admin-lock">
        <form className="admin-lock__card" onSubmit={handleUnlock}>
          <div className="admin__eyebrow">Follow-ups · Which Is Better?</div>
          <h1 className="admin-lock__title">Enter password</h1>
          <input
            className="admin-lock__input"
            type="password"
            autoFocus
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
          />
          {error && <p className="admin-lock__error">{error}</p>}
          <button type="submit" className="button button--primary" disabled={loading}>
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    )
  }

  const statusFor = (r: GameResponse) => edits[r.id]?.status ?? r.followUp.status
  const contacteeFor = (r: GameResponse) => edits[r.id]?.contactee ?? r.followUp.contactee

  /** Actionable rows only (not Resolved / Invalid), optionally one contactee. */
  function exportFollowUps() {
    const exportRows = rows.filter(({ response }) => {
      const status = statusFor(response)
      if (status === 'Resolved' || status === 'Invalid') return false
      if (exportScope && contacteeFor(response) !== exportScope) return false
      return true
    })
    const header = ['name', 'contact', 'is_student', 'potato', 'qualified_by', 'status', 'contactee']
    const data = exportRows.map(({ response, tier }) => [
      answerFor(response, 'name'),
      answerFor(response, 'contact'),
      answerFor(response, 'student'),
      TIER_LABELS[tier],
      qualifiersOf(response, tier).join('; '),
      statusFor(response),
      contacteeFor(response),
    ])
    const scopeSlug = exportScope ? exportScope.toLowerCase().replace(/\s+/g, '-') : 'all'
    downloadCsv(toCsv([header, ...data]), `followups-${scopeSlug}.csv`)
  }

  const tierCounts = TIERS.map((tier) => ({
    tier,
    count: rows.filter((r) => r.tier === tier).length,
  }))
  const statusCounts = FOLLOW_UP_STATUSES.map((status) => ({
    status,
    count: rows.filter((r) => statusFor(r.response) === status).length,
  }))
  const visible = rows.filter(
    (r) =>
      (!tierFilter || r.tier === tierFilter) &&
      (statusFilters.size === 0 || statusFilters.has(statusFor(r.response))),
  )

  return (
    <div className="admin followups">
      {compact ? (
        <div className="followups__compact-bar">
          <button type="button" className="button button--subtle button--small" onClick={toggleCompact}>
            ▾ Show header
          </button>
          <button
            type="button"
            className="button button--subtle button--small"
            onClick={() => load(password)}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      ) : (
        <header className="admin__header">
          <div>
            <div className="admin__eyebrow">
              Follow-ups · {viewerContactee ? `Assigned to ${viewerContactee}` : 'Which Is Better?'}
            </div>
            <h1 className="admin__title">Potato board</h1>
          </div>
          <div className="admin__header-actions">
            <button type="button" className="button button--subtle" onClick={toggleCompact}>
              ▴ Hide header
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => load(password)}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </header>
      )}

      {error && <p className="admin__error">⚠️ {error}</p>}

      {UNMATCHED_RULES.length > 0 && (
        <p className="followups__rule-warning">
          ⚠️ These tier rules match no current survey option (reworded in questions.json?), so
          they'll never fire for new responses — update src/data/followups.json:{' '}
          {UNMATCHED_RULES.join(' · ')}
        </p>
      )}

      <div className="followups__legend">
        <button
          type="button"
          className={`potato potato--filter${tierFilter === null ? ' potato--active' : ''}`}
          onClick={() => setTierFilter(null)}
          title="Everyone with a completed survey"
        >
          All · {rows.length}
        </button>
        {tierCounts.map(({ tier, count }) => (
          <button
            key={tier}
            type="button"
            className={`potato potato--${tier} potato--filter${tierFilter === tier ? ' potato--active' : ''}`}
            onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
            title={TIER_TOOLTIPS[tier]}
          >
            <span className="potato__dot" />
            {TIER_LABELS[tier]} · {count}
          </button>
        ))}
      </div>

      <div className="followups__legend">
        <button
          type="button"
          className={`potato potato--filter${statusFilters.size === 0 ? ' potato--active' : ''}`}
          onClick={() => setStatusFilters(new Set())}
          title="Show every status"
        >
          All statuses · {rows.length}
        </button>
        {statusCounts.map(({ status, count }) => {
          const selected = statusFilters.has(status)
          return (
            <button
              key={status}
              type="button"
              className={`potato potato--filter${selected ? ' potato--active' : ''}`}
              onClick={() => toggleStatusFilter(status)}
              aria-pressed={selected}
              title="Click to toggle — combine several statuses"
            >
              {selected ? '✓ ' : ''}
              {status} · {count}
            </button>
          )
        })}
      </div>

      {!viewerContactee && (
      <div className="followups__toolbar">
        <div className="followups__contactees">
          <span className="followups__toolbar-label">Contactees</span>
          {contactees.map((name) => (
            <span key={name} className="potato followups__contactee-chip">
              {name}
              <button
                type="button"
                className="followups__chip-x"
                onClick={() => removeContactee(name)}
                aria-label={`Remove contactee ${name}`}
              >
                ×
              </button>
            </span>
          ))}
          <form className="followups__add-contactee" onSubmit={addContactee}>
            <input
              className="followups__input"
              type="text"
              placeholder="Add contactee…"
              value={newContactee}
              onChange={(e) => setNewContactee(e.target.value)}
            />
            <button type="submit" className="button button--subtle button--small">
              Add
            </button>
          </form>
        </div>

        <div className="followups__export">
          <span className="followups__toolbar-label">Export</span>
          <select
            className="followups__input followups__status"
            value={exportScope}
            onChange={(e) => setExportScope(e.target.value)}
          >
            <option value="">Everyone</option>
            {contactees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--subtle button--small"
            onClick={exportFollowUps}
            title="Excludes Resolved and Invalid rows"
          >
            Export CSV
          </button>
        </div>
      </div>
      )}

      {rows.length === 0 && !loading ? (
        <p className="admin__empty">No completed surveys yet.</p>
      ) : visible.length === 0 ? (
        <p className="admin__empty">Nobody matches the current filters.</p>
      ) : (
        <div className="admin__table-wrap">
          <table className="admin__table followups__table">
            <thead>
              <tr>
                <SortHeader label="Completed" sortKey="time" />
                <SortHeader label="Name" sortKey="name" />
                <SortHeader label="Potato" sortKey="potato" />
                <th rowSpan={2}>Details</th>
                <SortHeader label="Status" sortKey="status" />
                {!viewerContactee && <SortHeader label="Contactee" sortKey="contactee" />}
                <th rowSpan={2} className="followups__notes-head">
                  Notes
                </th>
                {OPTION_QUESTIONS.map((q) => (
                  <th key={q.id} colSpan={q.options?.length ?? 1} className="followups__opt-group">
                    {q.question}
                  </th>
                ))}
              </tr>
              <tr>
                {OPTION_QUESTIONS.flatMap(
                  (q) =>
                    q.options?.map((option) => {
                      const key = optSortKey(q.id, option)
                      const active = sort.key === key
                      return (
                        <th
                          key={`${q.id}-${option}`}
                          className={`followups__opt-head followups__sortable${active ? ' followups__sortable--active' : ''}`}
                          onClick={() => toggleSort(key)}
                          role="button"
                          aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                        >
                          {option} {active ? (sort.dir === 1 ? '▲' : '▼') : ''}
                        </th>
                      )
                    }) ?? [],
                )}
              </tr>
            </thead>
            <tbody>
              {visible.map(({ response, tier }) => {
                const edit = edits[response.id] ?? response.followUp
                const saving = savingIds.has(response.id)
                return (
                  <tr key={response.id} className={saving ? 'followups__row--saving' : ''}>
                    <td className="admin__table-when">{formatDate(response.surveyCompletedAt)}</td>
                    <td className="followups__name">{answerFor(response, 'name') || '—'}</td>
                    <td>
                      <PotatoChip tier={tier} />
                    </td>
                    <td className="followups__details">
                      {DETAILS_QUESTIONS.map((q) => {
                        const value = answerFor(response, q.id)
                        if (!value) return null
                        return (
                          <div key={q.id}>
                            <span className="followups__detail-label">{q.id}</span> {value}
                          </div>
                        )
                      })}
                    </td>
                    <td>
                      <select
                        className="followups__input followups__status"
                        value={edit.status}
                        onChange={(e) => {
                          const status = e.target.value as FollowUpStatus
                          setField(response.id, 'status', status)
                          save(response.id, { ...edit, status })
                        }}
                      >
                        {FOLLOW_UP_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    {!viewerContactee && (
                      <td>
                        <select
                          className="followups__input followups__status"
                          value={edit.contactee}
                          onChange={(e) => {
                            const contactee = e.target.value
                            setField(response.id, 'contactee', contactee)
                            save(response.id, { ...edit, contactee })
                          }}
                        >
                          <option value="">—</option>
                          {/* Keep a legacy value visible even if it was removed from the list. */}
                          {(edit.contactee && !contactees.includes(edit.contactee)
                            ? [edit.contactee, ...contactees]
                            : contactees
                          ).map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td>
                      <textarea
                        className="followups__input followups__notes"
                        rows={2}
                        placeholder="Notes…"
                        value={edit.notes}
                        onChange={(e) => setField(response.id, 'notes', e.target.value)}
                        onBlur={() => saveIfChanged(response)}
                      />
                    </td>
                    {OPTION_QUESTIONS.flatMap(
                      (q) =>
                        q.options?.map((option) => (
                          <td key={`${q.id}-${option}`} className="followups__check">
                            {selectedIn(response, q.id, option) ? '✓' : ''}
                          </td>
                        )) ?? [],
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
