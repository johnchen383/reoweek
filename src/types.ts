export interface Pair {
  id: string
  left: string
  right: string
}

export type SurveyQuestionType = 'text' | 'longtext' | 'choice' | 'scale'

export interface SurveyQuestion {
  id: string
  type: SurveyQuestionType
  question: string
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  required?: boolean
}

/** One decision made during the card game. */
export interface Choice {
  pairId: string
  chosen: string
  other: string
}

/** One answered survey question. */
export interface SurveyAnswer {
  questionId: string
  question: string
  answer: string | number
}

/** Feature flags served by GET /api/config. */
export interface AppConfig {
  enableDelete: boolean
}

/** A persisted play-through: game choices plus (eventually) survey answers. */
export interface GameResponse {
  id: string
  choices: Choice[]
  survey: SurveyAnswer[]
  surveyCompletedAt: string | null
  createdAt: string
  updatedAt: string
}
