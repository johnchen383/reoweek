import { useEffect } from 'react'
import { burstConfetti } from '../utils/confetti'
import type { Choice } from '../types'

interface ResultsProps {
  choices: Choice[]
  saveError: string | null
  onRestart: () => void
}

/** Hand-drawn check rosette in the card-icon style — sparkles from
 * "Happiness", check from "Acceptance". */
function DoneBadge() {
  return (
    <svg viewBox="0 0 120 120" width="88" height="88" fill="none" aria-hidden="true">
      <circle cx="60" cy="64" r="34" fill="#E22A30" stroke="#2a0a0c" strokeWidth="4" />
      <path
        d="M44 64 l11 11 l22 -24"
        stroke="#FEFAF4"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 30 l7 7 M94 30 l-7 7 M60 15 v10"
        stroke="#911223"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Results({ choices, saveError, onRestart }: ResultsProps) {
  useEffect(() => burstConfetti(), [])

  return (
    <div className="done">
      <div className="done__badge">
        <DoneBadge />
      </div>
      <div className="done__eyebrow">All done · A Taste Test</div>
      <h2 className="done__title">
        Thanks for <span>playing</span>!
      </h2>
      <div className="done__rule" />
      <p className="done__sub">Here's everything you picked</p>

      <div className="results-list">
        {choices.map((choice, i) => (
          <div
            className="result-item"
            key={choice.pairId}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="result-item__num">{i + 1}</div>
            <div className="result-item__pair">
              <span className="result-item__chosen">{choice.chosen}</span>
              <span className="result-item__vs">vs</span>
              <span className="result-item__unchosen">{choice.other}</span>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="button button--primary done__restart" onClick={onRestart}>
        Play again
      </button>

      {saveError ? (
        <p className="done__save-note done__save-note--error">
          ⚠️ We couldn't save your answers ({saveError})
        </p>
      ) : (
        <p className="done__save-note">Your answers have been saved ✓</p>
      )}
    </div>
  )
}
