import { useRef, useState } from 'react'
import { api } from './api/client'
import { CardGame } from './components/CardGame'
import { Interlude } from './components/Interlude'
import { Survey } from './components/Survey'
import { Results } from './components/Results'
import { PAIRS, SURVEY_QUESTIONS } from './data/questions'
import type { Choice, SurveyAnswer } from './types'

type Stage = 'game' | 'interlude' | 'survey' | 'done'

export default function App() {
  const [stage, setStage] = useState<Stage>('game')
  const [choices, setChoices] = useState<Choice[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)
  // The persisted response id, or null if the initial save failed and we
  // should retry with a full create when the survey is submitted.
  const responseId = useRef<string | null>(null)

  function handleGameComplete(picked: Choice[]) {
    setChoices(picked)
    setStage('interlude')

    // Persist the choices right away — the survey is optional, so they must
    // be saved whether or not the player carries on.
    api
      .createResponse(picked)
      .then((response) => {
        responseId.current = response.id
        setSaveError(null)
      })
      .catch((err) => {
        // Not fatal — we retry with a full create on survey submit.
        responseId.current = null
        setSaveError(err instanceof Error ? err.message : 'Unknown error')
      })
  }

  async function handleSurveyComplete(answers: SurveyAnswer[]) {
    try {
      if (responseId.current) {
        await api.submitSurvey(responseId.current, answers)
      } else {
        await api.createResponse(choices, answers)
      }
      setSaveError(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error')
    }
    setStage('done')
  }

  function handleRestart() {
    responseId.current = null
    setChoices([])
    setSaveError(null)
    setStage('game')
  }

  return (
    <div className={`stage stage--${stage}`}>
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

      {stage === 'game' && (
        <>
          <header className="masthead">
            <div className="masthead__eyebrow">Est. 2026 · A Taste Test</div>
            <h1 className="masthead__title">
              Which Is <span>Better</span>?
            </h1>
            <div className="masthead__rule" />
            <div className="masthead__sub">Swipe a card outward to pick it</div>
          </header>
          <CardGame pairs={PAIRS} onComplete={handleGameComplete} />
        </>
      )}

      {stage === 'interlude' && (
        <Interlude onAccept={() => setStage('survey')} onSkip={() => setStage('done')} />
      )}

      {stage === 'survey' && (
        <Survey questions={SURVEY_QUESTIONS} onComplete={handleSurveyComplete} />
      )}

      {stage === 'done' && (
        <Results choices={choices} saveError={saveError} onRestart={handleRestart} />
      )}
    </div>
  )
}
