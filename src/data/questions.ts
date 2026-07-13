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
  (q.type === 'choice' || q.type === 'multichoice') && q.optionsFrom === 'pairs'
    ? { ...q, options: PAIRS.map(pairLabel) }
    : q,
)

// Answers are keyed by question id, so a duplicate id makes two questions
// silently share (and overwrite) one answer. Fail loudly instead.
for (const list of [PAIRS, SURVEY_QUESTIONS] as { id: string }[][]) {
  const seen = new Set<string>()
  for (const { id } of list) {
    if (seen.has(id)) {
      throw new Error(`Duplicate id "${id}" in src/data/questions.json — every id must be unique`)
    }
    seen.add(id)
  }
}
