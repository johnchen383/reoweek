/**
 * Hand-drawn style eye for the password show/hide toggle — stroke follows
 * `currentColor` so the button's CSS controls it. `slashed` marks the
 * "visible, click to hide" state.
 */
export function EyeIcon({ slashed }: { slashed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12 C5.5 6.8 9 4.8 12 4.8 C15 4.8 18.5 6.8 21.5 12 C18.5 17.2 15 19.2 12 19.2 C9 19.2 5.5 17.2 2.5 12 Z" />
      <circle cx="12" cy="12" r="2.8" fill="currentColor" stroke="none" />
      {slashed && <path d="M4.5 20 L19.5 4" />}
    </svg>
  )
}
