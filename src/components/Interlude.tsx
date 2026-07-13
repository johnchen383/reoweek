interface InterludeProps {
  onAccept: () => void;
  onSkip: () => void;
}

/**
 * Shown between the card game and the survey — the survey is optional, so
 * this asks nicely before diving in.
 */
export function Interlude({ onAccept, onSkip }: InterludeProps) {
  return (
    <div className="interlude">
      <div className="interlude__emoji">💬</div>
      <div className="interlude__eyebrow">Thanks for playing!</div>
      <h2 className="interlude__title">
        We'd love to hear <span>your feedback</span>
      </h2>
      <p className="interlude__sub">1 min survey | $200 prize pool</p>
      <div className="interlude__actions">
        <button
          type="button"
          className="button button--primary"
          onClick={onAccept}>
          Let's go!
        </button>
        <button type="button" className="interlude__skip" onClick={onSkip}>
          No thanks
        </button>
      </div>
    </div>
  );
}
