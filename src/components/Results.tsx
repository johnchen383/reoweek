import type { Choice } from '../types'

interface ResultsProps {
  choices: Choice[]
  saveError: string | null
  onRestart: () => void
}

export function Results({ choices, saveError, onRestart }: ResultsProps) {
  return (
    <div className="done">
      <div className="done__emoji">🍃</div>
      <h2>Thanks for playing!</h2>
      <p>Here's everything you picked</p>

      <div className="results-list">
        {choices.map((choice, i) => (
          <div className="result-item" key={choice.pairId}>
            <div className="result-item__num">{i + 1}</div>
            <div className="result-item__pair">
              <span className="result-item__chosen">{choice.chosen}</span>
              <span className="result-item__vs">vs</span>
              <span className="result-item__unchosen">{choice.other}</span>
            </div>
          </div>
        ))}
      </div>

      {saveError ? (
        <p className="done__save-note done__save-note--error">
          ⚠️ We couldn't save your answers ({saveError})
        </p>
      ) : (
        <p className="done__save-note">Your answers have been saved ✓</p>
      )}

      <button type="button" className="button button--primary done__restart" onClick={onRestart}>
        Play again
      </button>
    </div>
  )
}
