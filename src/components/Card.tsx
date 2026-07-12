import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { CardIcon } from './CardIcon'
import { haptics } from '../utils/haptics'

export type CardSide = 'left' | 'right'
export type CardState = 'idle' | 'picked' | 'faded'

interface CardProps {
  label: string
  side: CardSide
  number: number
  state: CardState
  onChoose: () => void
}

const SWIPE_THRESHOLD = 70

/**
 * A swipeable playing card. Drag it outward past the threshold (or simply
 * tap it) to choose it. Drag transforms are applied directly to the DOM node
 * so the gesture stays smooth without re-rendering on every pointer move.
 */
export function Card({ label, side, number, state, onChoose }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    active: false,
    moved: false,
    armed: false,
  })

  function isOutward(dx: number) {
    return side === 'left' ? dx < -SWIPE_THRESHOLD : dx > SWIPE_THRESHOLD
  }

  function pointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (state !== 'idle') return
    const el = ref.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      active: true,
      moved: false,
      armed: false,
    }
    el.style.transition = 'none'
    // Cancel the deal-in animation so it can't fight the drag transform.
    el.style.animation = 'none'
  }

  function pointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current
    const el = ref.current
    if (!d.active || !el) return
    d.dx = e.clientX - d.startX
    d.dy = e.clientY - d.startY
    if (Math.abs(d.dx) > 5 || Math.abs(d.dy) > 5) d.moved = true
    // A small buzz when the swipe crosses the release threshold.
    const outward = isOutward(d.dx)
    if (outward && !d.armed) haptics.tick()
    d.armed = outward
    const rot = d.dx / 25
    el.style.transform = `translate(${d.dx}px, ${d.dy * 0.3}px) rotate(${rot}deg)`
  }

  function pointerUp() {
    const d = drag.current
    const el = ref.current
    if (!d.active || !el) return
    d.active = false
    el.style.transition = ''

    const outward = isOutward(d.dx)

    if (outward || !d.moved) {
      // Fly outward, then let the parent advance to the next pair.
      const flyX = side === 'left' ? -90 : 90
      el.style.transform = `translateX(${flyX}px) scale(1.05)`
      onChoose()
    } else {
      el.style.transform = ''
    }
    d.dx = 0
    d.dy = 0
  }

  return (
    <div
      ref={ref}
      className={`card card--${side}${state === 'picked' ? ' card--picked' : ''}${state === 'faded' ? ' card--faded' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Choose ${label}`}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={pointerUp}
      onKeyDown={(e) => {
        if (state === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onChoose()
        }
      }}
    >
      <div className="card__inner">
        <div className="card__label">{label}</div>
        <div className="card__icon">
          <CardIcon label={label} />
        </div>
        <div className="card__number">{number}</div>
      </div>
    </div>
  )
}
