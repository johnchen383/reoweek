import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { SurveyAnswer, SurveyQuestion } from '../types'

interface SurveyProps {
  questions: SurveyQuestion[]
  /** Called with all answers when the last question is submitted. May throw to keep the user on the form. */
  onComplete: (answers: SurveyAnswer[]) => Promise<void>
}

const LETTERS = 'ABCDEFGHIJ'

/**
 * A Typeform-style, one-question-at-a-time survey. Enter advances, choices
 * and scales auto-advance on selection, and the thin bar up top tracks
 * progress.
 */
export function Survey({ questions, onComplete }: SurveyProps) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const advanceTimer = useRef<number | undefined>(undefined)

  const question = questions[index]
  const value = answers[question.id]
  const isLast = index === questions.length - 1

  useEffect(() => {
    inputRef.current?.focus()
    return () => window.clearTimeout(advanceTimer.current)
  }, [index])

  function setAnswer(id: string, answer: string | number) {
    setError(null)
    setAnswers((prev) => ({ ...prev, [id]: answer }))
  }

  async function next(currentAnswers = answers) {
    const answer = currentAnswers[question.id]
    const empty = answer === undefined || (typeof answer === 'string' && answer.trim() === '')
    if (question.required && empty) {
      setError('Please fill this in')
      return
    }

    if (!isLast) {
      setError(null)
      setIndex(index + 1)
      return
    }

    // Last question — build the answer list and hand it to the parent.
    const built: SurveyAnswer[] = questions
      .filter((q) => {
        const a = currentAnswers[q.id]
        return a !== undefined && !(typeof a === 'string' && a.trim() === '')
      })
      .map((q) => ({
        questionId: q.id,
        question: q.question,
        answer: currentAnswers[q.id],
      }))

    setSubmitting(true)
    setError(null)
    try {
      await onComplete(built)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
    } finally {
      setSubmitting(false)
    }
  }

  /** Select an option, show it highlighted briefly, then advance. */
  function selectAndAdvance(answer: string | number) {
    if (submitting) return
    setAnswer(question.id, answer)
    window.clearTimeout(advanceTimer.current)
    const updated = { ...answers, [question.id]: answer }
    advanceTimer.current = window.setTimeout(() => next(updated), 350)
  }

  function back() {
    if (index > 0 && !submitting) {
      setError(null)
      setIndex(index - 1)
    }
  }

  return (
    <div className="survey">
      <div className="survey__progress-track" aria-hidden="true">
        <div
          className="survey__progress-fill"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <div className="survey__question" key={question.id}>
        <div className="survey__counter">
          {index + 1} <span className="survey__arrow">→</span>
        </div>
        <h2 className="survey__title">
          {question.question}
          {question.required && <span className="survey__required">*</span>}
        </h2>

        {question.type === 'text' && (
          <input
            ref={inputRef as RefObject<HTMLInputElement>}
            className="survey__input"
            type="text"
            placeholder={question.placeholder ?? 'Type your answer…'}
            value={(value as string) ?? ''}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') next()
            }}
          />
        )}

        {question.type === 'longtext' && (
          <textarea
            ref={inputRef as RefObject<HTMLTextAreaElement>}
            className="survey__input survey__input--area"
            rows={3}
            placeholder={question.placeholder ?? 'Type your answer…'}
            value={(value as string) ?? ''}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                next()
              }
            }}
          />
        )}

        {question.type === 'choice' && (
          <div className="survey__options">
            {question.options?.map((option, i) => (
              <button
                key={option}
                type="button"
                className={`survey__option${value === option ? ' survey__option--selected' : ''}`}
                onClick={() => selectAndAdvance(option)}
              >
                <span className="survey__option-key">{LETTERS[i]}</span>
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === 'scale' && (
          <div className="survey__scale">
            <div className="survey__scale-buttons">
              {Array.from(
                { length: (question.max ?? 5) - (question.min ?? 1) + 1 },
                (_, i) => (question.min ?? 1) + i,
              ).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`survey__scale-btn${value === n ? ' survey__scale-btn--selected' : ''}`}
                  onClick={() => selectAndAdvance(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            {(question.minLabel || question.maxLabel) && (
              <div className="survey__scale-labels">
                <span>{question.minLabel}</span>
                <span>{question.maxLabel}</span>
              </div>
            )}
          </div>
        )}

        {error && <p className="survey__error">{error}</p>}

        <div className="survey__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => next()}
            disabled={submitting}
          >
            {submitting ? 'Saving…' : isLast ? 'Finish' : 'OK'}
          </button>
          {(question.type === 'text' || question.type === 'longtext') && !submitting && (
            <span className="survey__enter-hint">
              press <strong>Enter ↵</strong>
            </span>
          )}
        </div>
      </div>

      {index > 0 && (
        <button type="button" className="survey__back" onClick={back} disabled={submitting}>
          ↑ Back
        </button>
      )}
    </div>
  )
}
