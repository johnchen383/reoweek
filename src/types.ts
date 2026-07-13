export interface Pair {
  id: string;
  left: string;
  right: string;
}

export type SurveyQuestionType =
  | 'text'
  | 'email'
  | 'phone'
  | 'longtext'
  | 'choice'
  | 'multichoice'
  | 'scale'

/** A single answer value: text/choice/scale, or the selections of a multichoice. */
export type AnswerValue = string | number | string[]

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  question: string;
  placeholder?: string;
  options?: string[];
  /** For choice questions: derive the options instead of listing them ("pairs" → one per matchup). */
  optionsFrom?: "pairs";
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  required?: boolean;
}

/** One decision made during the card game. */
export interface Choice {
  pairId: string;
  chosen: string;
  other: string;
}

/** One answered survey question. */
export interface SurveyAnswer {
  questionId: string
  question: string
  answer: AnswerValue
}

/** Feature flags served by GET /api/config. */
export interface AppConfig {
  enableDelete: boolean;
}

/** A persisted play-through: game choices plus (eventually) survey answers. */
export interface GameResponse {
  id: string;
  choices: Choice[];
  survey: SurveyAnswer[];
  surveyCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
