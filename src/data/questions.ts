import raw from './questions.json'
import type { Pair, SurveyQuestion } from '../types'

export const PAIRS = raw.pairs as Pair[]

export function pairLabel(pair: Pair) {
  return `${pair.left} vs ${pair.right}`
}

/**
 * Survey questions with derived options expanded — a choice question with
 * `"optionsFrom": "pairs"` gets one option per matchup, so editing the pairs
 * never requires touching the question.
 */
export const SURVEY_QUESTIONS = (raw.survey as SurveyQuestion[]).map((q) =>
  q.type === 'choice' && q.optionsFrom === 'pairs'
    ? { ...q, options: PAIRS.map(pairLabel) }
    : q,
)
