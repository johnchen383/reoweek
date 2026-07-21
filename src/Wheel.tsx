import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api, ApiError } from './api/client'
import { burstConfetti } from './utils/confetti'
import type { GameResponse } from './types'

// Shared with /admin and /followups so unlocking one unlocks all.
const PASSWORD_STORAGE_KEY = 'wib-admin-password'

const SPIN_MS = 6400
const SEG_COLORS = ['#e22a30', '#fefaf4', '#911223', '#f3dcdc']
const SEG_TEXT = ['#fefaf4', '#2a0a0c', '#fefaf4', '#2a0a0c']

interface Entrant {
  id: string
  name: string
  contact: string
}

/**
 * Everyone whose answers opted into the prize draw. Matched on the word
 * "draw" so the option text in questions.json can be reworded freely.
 * Responses marked Invalid on /followups are excluded.
 */
function entrantsFrom(responses: GameResponse[]): Entrant[] {
  return responses
    .filter((r) => r.followUp.status !== 'Invalid')
    .filter((r) =>
      r.survey.some((a) => {
        const values = Array.isArray(a.answer) ? a.answer : [String(a.answer)]
        return values.some((v) => /draw/i.test(v))
      }),
    )
    .map((r) => ({
      id: r.id,
      name: String(r.survey.find((a) => a.questionId === 'name')?.answer ?? '').trim() || 'Mystery player',
      contact: String(r.survey.find((a) => a.questionId === 'contact')?.answer ?? '').trim(),
    }))
}

/** Point on the wheel rim, angle in degrees clockwise from 12 o'clock. */
function rim(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
}

function segmentPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = rim(cx, cy, r, a0)
  const p1 = rim(cx, cy, r, a1)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y} Z`
}

function secureRandomIndex(length: number) {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % length
}

// Long, satisfying deceleration.
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export default function Wheel() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [responses, setResponses] = useState<GameResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())
  const [spinning, setSpinning] = useState(false)
  const [liveIndex, setLiveIndex] = useState<number | null>(null)
  const [winner, setWinner] = useState<Entrant | null>(null)
  // Stays visible under the wheel after the overlay is dismissed.
  const [lastWinner, setLastWinner] = useState<Entrant | null>(null)

  const wheelRef = useRef<SVGGElement>(null)
  const rotationRef = useRef(0)
  const frameRef = useRef(0)

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
        setError(err instanceof Error ? err.message : 'Failed to load entries')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem(PASSWORD_STORAGE_KEY)
    if (stored) {
      setPassword(stored)
      load(stored)
    }
    return () => cancelAnimationFrame(frameRef.current)
  }, [load])

  const pool = useMemo(
    () => entrantsFrom(responses).filter((e) => !excluded.has(e.id)),
    [responses, excluded],
  )
  const segDeg = pool.length > 0 ? 360 / pool.length : 360
  const showLabels = pool.length > 0 && pool.length <= 28

  function applyRotation(deg: number) {
    rotationRef.current = deg
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${deg}deg)`
    }
  }

  function indexAt(rotation: number) {
    if (pool.length === 0) return null
    const at = (((360 - (rotation % 360)) % 360) + 360) % 360
    return Math.floor(at / segDeg) % pool.length
  }

  function spin() {
    if (spinning || pool.length < 2) return
    setWinner(null)
    setSpinning(true)

    const winnerIdx = secureRandomIndex(pool.length)
    // Land the winner's segment under the top pointer, with some jitter so it
    // doesn't always stop dead-center.
    const jitter = (Math.random() - 0.5) * segDeg * 0.7
    const finalMod = ((-(winnerIdx * segDeg + segDeg / 2 + jitter) % 360) + 360) % 360
    const from = rotationRef.current
    const delta = 5 * 360 + ((finalMod - from) % 360 + 360) % 360
    const start = performance.now()

    function frame(now: number) {
      const t = Math.min((now - start) / SPIN_MS, 1)
      const deg = from + delta * easeOutQuart(t)
      applyRotation(deg)
      setLiveIndex(indexAt(deg))
      if (t < 1) {
        frameRef.current = requestAnimationFrame(frame)
      } else {
        const landed = indexAt(deg)
        const won = pool[landed ?? winnerIdx]
        setWinner(won)
        setLastWinner(won)
        setSpinning(false)
        burstConfetti()
        window.setTimeout(() => burstConfetti(), 450)
      }
    }
    frameRef.current = requestAnimationFrame(frame)
  }

  function removeWinnerAndSpin() {
    if (!winner) return
    setExcluded((prev) => new Set(prev).add(winner.id))
    setWinner(null)
    setLiveIndex(null)
  }

  if (!authed) {
    return (
      <div className="admin-lock">
        <form
          className="admin-lock__card"
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            load(password)
          }}
        >
          <div className="admin__eyebrow">The Draw · Which Is Better?</div>
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

  const liveName = liveIndex !== null && pool[liveIndex] ? pool[liveIndex].name : null

  return (
    <div className="stage wheel">
      <svg className="grain" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      <header className="masthead wheel__masthead">
        <div className="masthead__eyebrow">The Draw</div>
        <h1 className="masthead__title wheel__title">
          Prize <span>Wheel</span>
        </h1>
        <div className="masthead__rule" />
        <div className="masthead__sub wheel__sub">
          {pool.length} {pool.length === 1 ? 'entry' : 'entries'} in the draw
        </div>
      </header>

      {error && <p className="admin__error">⚠️ {error}</p>}

      {pool.length < 2 ? (
        <p className="admin__empty">Not enough entries to spin yet.</p>
      ) : (
        <div className="wheel__arena">
          <div className="wheel__pointer" aria-hidden="true" />
          <svg className="wheel__disc" viewBox="0 0 420 420" role="img" aria-label="Prize wheel">
            <circle cx="210" cy="210" r="206" fill="#ffffff" stroke="#2a0a0c" strokeWidth="5" />
            <g ref={wheelRef} className="wheel__rotor">
              {pool.map((entrant, i) => {
                const a0 = i * segDeg
                const a1 = (i + 1) * segDeg
                const color = SEG_COLORS[i % SEG_COLORS.length]
                return (
                  <path
                    key={entrant.id}
                    d={segmentPath(210, 210, 196, a0, a1)}
                    fill={color}
                    stroke="#2a0a0c"
                    strokeWidth={pool.length > 60 ? 0.6 : 1.5}
                  />
                )
              })}
              {showLabels &&
                pool.map((entrant, i) => {
                  const mid = i * segDeg + segDeg / 2
                  const pos = rim(210, 210, 120, mid)
                  return (
                    <text
                      key={`label-${entrant.id}`}
                      x={pos.x}
                      y={pos.y}
                      transform={`rotate(${mid} ${pos.x} ${pos.y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={pool.length > 16 ? 11 : 14}
                      fontWeight="700"
                      fill={SEG_TEXT[i % SEG_TEXT.length]}
                    >
                      {entrant.name.length > 14 ? `${entrant.name.slice(0, 13)}…` : entrant.name}
                    </text>
                  )
                })}
            </g>
            <circle cx="210" cy="210" r="46" fill="#ffffff" stroke="#2a0a0c" strokeWidth="4" />
          </svg>
          <button
            type="button"
            className="wheel__hub"
            onClick={spin}
            disabled={spinning}
            aria-label="Spin the wheel"
          >
            {spinning ? '…' : 'SPIN'}
          </button>
        </div>
      )}

      <div
        className={`wheel__live${spinning ? ' wheel__live--spinning' : ''}${!spinning && lastWinner ? ' wheel__live--winner' : ''}`}
        aria-live="off"
      >
        {spinning ? (liveName ?? '') : lastWinner ? `🏆 ${lastWinner.name}` : ''}
      </div>

      {winner && (
        <div className="wheel__winner" role="alert">
          <div className="wheel__winner-eyebrow">We have a winner!</div>
          <div className="wheel__winner-name">{winner.name}</div>
          {winner.contact && <div className="wheel__winner-contact">{winner.contact}</div>}
          <div className="wheel__winner-actions">
            <button type="button" className="button button--primary" onClick={removeWinnerAndSpin}>
              Remove &amp; spin again
            </button>
            <button type="button" className="button button--subtle" onClick={() => setWinner(null)}>
              Keep everyone in
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
