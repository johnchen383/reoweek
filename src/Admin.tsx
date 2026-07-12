import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from './api/client'
import { PAIRS, SURVEY_QUESTIONS } from './data/questions'
import { downloadCsv, responsesToCsv } from './utils/csv'
import type { GameResponse, Pair } from './types'

// Two-slot categorical palette for the head-to-head split bars, validated
// against the cream surface (#FEFAF4): CVD ΔE 19.5, contrast >= 3:1.
const COLOR_LEFT = '#e22a30'
const COLOR_RIGHT = '#9c1226'

interface PairStat {
  pair: Pair
  leftCount: number
  rightCount: number
  total: number
}

function usePairStats(responses: GameResponse[]): PairStat[] {
  return useMemo(
    () =>
      PAIRS.map((pair) => {
        let leftCount = 0
        let rightCount = 0
        for (const response of responses) {
          for (const choice of response.choices) {
            if (choice.pairId !== pair.id) continue
            if (choice.chosen === pair.left) leftCount++
            else if (choice.chosen === pair.right) rightCount++
          }
        }
        return { pair, leftCount, rightCount, total: leftCount + rightCount }
      }),
    [responses],
  )
}

/** All answers to one survey question across every response. */
function answersFor(responses: GameResponse[], questionId: string) {
  return responses.flatMap((r) =>
    r.survey.filter((a) => a.questionId === questionId).map((a) => a.answer),
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Kept for the tab session only, so a refresh doesn't re-prompt.
const PASSWORD_STORAGE_KEY = 'wib-admin-password'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [responses, setResponses] = useState<GameResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [deleteEnabled, setDeleteEnabled] = useState(false)

  const load = useCallback(async (pw: string) => {
    if (!pw) {
      setError('Enter the password')
      return
    }
    setLoading(true)
    setError(null)
    try {
      setResponses(await api.listResponses(pw))
      setAuthed(true)
      sessionStorage.setItem(PASSWORD_STORAGE_KEY, pw)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthed(false)
        sessionStorage.removeItem(PASSWORD_STORAGE_KEY)
        setError('Incorrect password')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load responses')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-authenticate silently if this tab already unlocked the page.
  useEffect(() => {
    const stored = sessionStorage.getItem(PASSWORD_STORAGE_KEY)
    if (stored) {
      setPassword(stored)
      load(stored)
    }
  }, [load])

  // The danger zone only renders when deleting is enabled server-side.
  useEffect(() => {
    api
      .getConfig()
      .then((config) => setDeleteEnabled(config.enableDelete))
      .catch(() => setDeleteEnabled(false))
  }, [])

  function handleUnlock(e: FormEvent) {
    e.preventDefault()
    load(password)
  }

  async function handleClearAll() {
    setClearing(true)
    setError(null)
    try {
      await api.deleteAllResponses(password)
      setResponses([])
      setConfirmingClear(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data')
    } finally {
      setClearing(false)
    }
  }

  const pairStats = usePairStats(responses)

  const surveysCompleted = responses.filter((r) => r.surveyCompletedAt).length
  const completionRate =
    responses.length > 0 ? Math.round((surveysCompleted / responses.length) * 100) : 0

  if (!authed) {
    return (
      <div className="admin-lock">
        <form className="admin-lock__card" onSubmit={handleUnlock}>
          <div className="admin__eyebrow">Admin · Which Is Better?</div>
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

  return (
    <div className="admin">
      <header className="admin__header">
        <div>
          <div className="admin__eyebrow">Admin · Which Is Better?</div>
          <h1 className="admin__title">Results</h1>
        </div>
        <div className="admin__header-actions">
          {responses.length > 0 && (
            <button
              type="button"
              className="button button--subtle"
              onClick={() =>
                downloadCsv(
                  responsesToCsv(responses, PAIRS, SURVEY_QUESTIONS),
                  'which-is-better-results.csv',
                )
              }
            >
              Export CSV
            </button>
          )}
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

      {error && (
        <p className="admin__error">⚠️ {error}</p>
      )}

      {!error && !loading && responses.length === 0 && (
        <p className="admin__empty">No plays yet — results will appear here as they come in.</p>
      )}

      {responses.length > 0 && (
        <>
          <section className="admin__kpis">
            <div className="stat-tile">
              <div className="stat-tile__label">Total plays</div>
              <div className="stat-tile__value">{responses.length}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile__label">Surveys completed</div>
              <div className="stat-tile__value">{surveysCompleted}</div>
              <div className="stat-tile__detail">{completionRate}% of plays</div>
            </div>
            {SURVEY_QUESTIONS.filter((q) => q.type === 'scale').map((q) => {
              const values = answersFor(responses, q.id).filter(
                (a): a is number => typeof a === 'number',
              )
              const avg =
                values.length > 0
                  ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1)
                  : '—'
              return (
                <div className="stat-tile" key={q.id}>
                  <div className="stat-tile__label">Avg · {q.question}</div>
                  <div className="stat-tile__value">
                    {avg}
                    {values.length > 0 && (
                      <span className="stat-tile__outof"> / {q.max ?? 5}</span>
                    )}
                  </div>
                  <div className="stat-tile__detail">{values.length} answers</div>
                </div>
              )
            })}
          </section>

          <section className="admin__section">
            <h2 className="admin__section-title">Head-to-head</h2>
            <p className="admin__section-sub">Share of picks per matchup</p>
            <div className="matchups">
              {pairStats.map(({ pair, leftCount, rightCount, total }) => {
                const leftPct = total > 0 ? Math.round((leftCount / total) * 100) : 0
                const rightPct = total > 0 ? 100 - leftPct : 0
                return (
                  <div className="matchup" key={pair.id}>
                    <div className="matchup__labels">
                      <span
                        className={`matchup__label${leftCount >= rightCount && total > 0 ? ' matchup__label--winner' : ''}`}
                      >
                        <span className="matchup__dot" style={{ background: COLOR_LEFT }} />
                        {pair.left} · {leftCount} ({leftPct}%)
                      </span>
                      <span
                        className={`matchup__label${rightCount > leftCount ? ' matchup__label--winner' : ''}`}
                      >
                        {pair.right} · {rightCount} ({rightPct}%)
                        <span className="matchup__dot" style={{ background: COLOR_RIGHT }} />
                      </span>
                    </div>
                    {total > 0 ? (
                      <div className="matchup__bar">
                        <div
                          className="matchup__segment matchup__segment--left"
                          style={{ width: `${leftPct}%`, background: COLOR_LEFT }}
                          title={`${pair.left}: ${leftCount} of ${total} picks (${leftPct}%)`}
                        />
                        <div
                          className="matchup__segment matchup__segment--right"
                          style={{ width: `${rightPct}%`, background: COLOR_RIGHT }}
                          title={`${pair.right}: ${rightCount} of ${total} picks (${rightPct}%)`}
                        />
                      </div>
                    ) : (
                      <div className="matchup__bar matchup__bar--empty">no picks yet</div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {SURVEY_QUESTIONS.filter((q) => q.type === 'choice').map((q) => {
            const values = answersFor(responses, q.id)
            const counts = (q.options ?? []).map(
              (option) => values.filter((v) => v === option).length,
            )
            const max = Math.max(...counts, 1)
            return (
              <section className="admin__section" key={q.id}>
                <h2 className="admin__section-title">{q.question}</h2>
                <p className="admin__section-sub">{values.length} answers</p>
                <div className="dist">
                  {(q.options ?? []).map((option, i) => (
                    <div className="dist__row" key={option}>
                      <span className="dist__name">{option}</span>
                      <div className="dist__track">
                        <div
                          className="dist__fill"
                          style={{ width: `${(counts[i] / max) * 100}%` }}
                          title={`${option}: ${counts[i]}`}
                        />
                      </div>
                      <span className="dist__count">{counts[i]}</span>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {SURVEY_QUESTIONS.filter((q) => q.type === 'scale').map((q) => {
            const values = answersFor(responses, q.id).filter(
              (a): a is number => typeof a === 'number',
            )
            const min = q.min ?? 1
            const max = q.max ?? 5
            const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i)
            const counts = steps.map((n) => values.filter((v) => v === n).length)
            const tallest = Math.max(...counts, 1)
            return (
              <section className="admin__section" key={q.id}>
                <h2 className="admin__section-title">{q.question}</h2>
                <p className="admin__section-sub">{values.length} answers</p>
                <div className="histo">
                  {steps.map((n, i) => (
                    <div className="histo__col" key={n}>
                      <span className="histo__count">{counts[i]}</span>
                      <div
                        className="histo__bar"
                        style={{ height: `${(counts[i] / tallest) * 100}%` }}
                        title={`${n}: ${counts[i]} answers`}
                      />
                      <span className="histo__tick">{n}</span>
                    </div>
                  ))}
                </div>
                {(q.minLabel || q.maxLabel) && (
                  <div className="histo__labels">
                    <span>{q.minLabel}</span>
                    <span>{q.maxLabel}</span>
                  </div>
                )}
              </section>
            )
          })}

          {SURVEY_QUESTIONS.filter((q) =>
            ['text', 'email', 'phone', 'longtext'].includes(q.type),
          ).map((q) => {
            const values = answersFor(responses, q.id).filter(
              (a): a is string => typeof a === 'string' && a.trim() !== '',
            )
            if (values.length === 0) return null
            return (
              <section className="admin__section" key={q.id}>
                <h2 className="admin__section-title">{q.question}</h2>
                <p className="admin__section-sub">{values.length} answers</p>
                <ul className="quotes">
                  {values.map((value, i) => (
                    <li className="quotes__item" key={i}>
                      {value}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          <section className="admin__section">
            <h2 className="admin__section-title">All responses</h2>
            <p className="admin__section-sub">Raw data, newest first</p>
            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Picks</th>
                    <th>Survey</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r) => (
                    <tr key={r.id}>
                      <td className="admin__table-when">{formatDate(r.createdAt)}</td>
                      <td>{r.choices.map((c) => c.chosen).join(' · ')}</td>
                      <td>
                        {r.surveyCompletedAt
                          ? r.survey.map((a) => `${a.answer}`).join(' · ')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {deleteEnabled && (
            <section className="admin__section admin__section--danger">
              <h2 className="admin__section-title">Danger zone</h2>
              <p className="admin__section-sub">Permanently delete every response</p>
              {confirmingClear ? (
                <div className="danger-confirm">
                  <p className="danger-confirm__text">
                    This deletes all {responses.length}{' '}
                    {responses.length === 1 ? 'response' : 'responses'} — game picks and survey
                    answers. It cannot be undone.
                  </p>
                  <div className="danger-confirm__actions">
                    <button
                      type="button"
                      className="button button--danger"
                      onClick={handleClearAll}
                      disabled={clearing}
                    >
                      {clearing ? 'Deleting…' : 'Yes, delete everything'}
                    </button>
                    <button
                      type="button"
                      className="button button--subtle"
                      onClick={() => setConfirmingClear(false)}
                      disabled={clearing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => setConfirmingClear(true)}
                >
                  Clear all data…
                </button>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
