/**
 * Fire a short vibration on devices that support it (mostly Android Chrome).
 * Silently does nothing elsewhere — including iOS Safari, which has no
 * vibration API.
 */
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // some browsers throw when vibration is blocked by permissions policy
    }
  }
}

export const haptics = {
  /** Crossing the swipe threshold — the card is now "armed". */
  tick: () => vibrate(8),
  /** A choice was made. */
  pick: () => vibrate(14),
  /** The whole deck is done. */
  finish: () => vibrate([14, 70, 26]),
}
