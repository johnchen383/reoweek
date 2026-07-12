import { useEffect, useRef, useState } from 'react'
import { Card, type CardSide } from './Card'
import { haptics } from '../utils/haptics'
import type { Choice, Pair } from '../types'

interface CardGameProps {
  pairs: Pair[]
  onComplete: (choices: Choice[]) => void
}

const ADVANCE_DELAY_MS = 450

export function CardGame({ pairs, onComplete }: CardGameProps) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<CardSide | null>(null)
  const choicesRef = useRef<Choice[]>([])
  const timerRef = useRef<number | undefined>(undefined)

  const pair = pairs[index]

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  // Keyboard: arrow keys pick a side.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') choose('left')
      if (e.key === 'ArrowRight') choose('right')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function choose(side: CardSide) {
    if (picked || !pair) return
    setPicked(side)
    haptics.pick()

    const chosen = side === 'left' ? pair.left : pair.right
    const other = side === 'left' ? pair.right : pair.left
    choicesRef.current = [...choicesRef.current, { pairId: pair.id, chosen, other }]

    timerRef.current = window.setTimeout(() => {
      if (index + 1 >= pairs.length) {
        haptics.finish()
        onComplete(choicesRef.current)
      } else {
        setPicked(null)
        setIndex(index + 1)
      }
    }, ADVANCE_DELAY_MS)
  }

  if (!pair) return null

  return (
    <>
      <div className="arena">
        <Card
          key={`${pair.id}-left`}
          label={pair.left}
          side="left"
          number={index + 1}
          state={picked === 'left' ? 'picked' : picked === 'right' ? 'faded' : 'idle'}
          onChoose={() => choose('left')}
        />
        <div className="vs" key={`${pair.id}-vs`}>
          VS
        </div>
        <Card
          key={`${pair.id}-right`}
          label={pair.right}
          side="right"
          number={index + 1}
          state={picked === 'right' ? 'picked' : picked === 'left' ? 'faded' : 'idle'}
          onChoose={() => choose('right')}
        />
      </div>

      <div className="hint">Swipe outward, or tap to choose</div>
      <div className="progress">
        {index + 1} / {pairs.length}
      </div>
    </>
  )
}
