interface InterludeProps {
  onAccept: () => void
  onSkip: () => void
}

/**
 * Shown between the card game and the survey — the survey is optional, so
 * this asks nicely before diving in.
 */
export function Interlude({ onAccept, onSkip }: InterludeProps) {
  return (
    <div className="interlude">
      <div className="interlude__emoji">💬</div>
      <div className="interlude__eyebrow">One more thing</div>
      <h2 className="interlude__title">
        Want to <span>tell us more</span>?
      </h2>
      <p className="interlude__sub">A few quick questions · totally optional</p>
      <div className="interlude__actions">
        <button type="button" className="button button--primary" onClick={onAccept}>
          Sure, let's go
        </button>
        <button type="button" className="interlude__skip" onClick={onSkip}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
