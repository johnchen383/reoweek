import type { GameResponse, Pair, SurveyQuestion } from '../types'
import { pairLabel } from '../data/questions'

function escapeCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** One row per response: timestamp, the pick for each matchup, each survey answer. */
export function responsesToCsv(
  responses: GameResponse[],
  pairs: Pair[],
  questions: SurveyQuestion[],
) {
  const header = [
    'Submitted',
    ...pairs.map(pairLabel),
    ...questions.map((q) => q.question),
    'Survey completed',
  ]

  const rows = responses.map((r) => [
    new Date(r.createdAt).toISOString(),
    ...pairs.map((p) => r.choices.find((c) => c.pairId === p.id)?.chosen ?? ''),
    ...questions.map((q) => {
      const answer = r.survey.find((a) => a.questionId === q.id)
      if (!answer) return ''
      return Array.isArray(answer.answer) ? answer.answer.join('; ') : String(answer.answer)
    }),
    r.surveyCompletedAt ? 'yes' : 'no',
  ])

  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
}

export function downloadCsv(csv: string, filename: string) {
  // UTF-8 BOM so Excel detects the encoding (answers may contain non-ASCII).
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
