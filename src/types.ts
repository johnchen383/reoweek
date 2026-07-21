export interface Pair {
  id: string;
  left: string;
  right: string;
  title: string;
}

export type SurveyQuestionType =
  | "text"
  | "email"
  | "phone"
  | "longtext"
  | "choice"
  | "multichoice"
  | "scale";

/** A single answer value: text/choice/scale, or the selections of a multichoice. */
export type AnswerValue = string | number | string[];

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  question: string;
  subLabel?: string;
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
  questionId: string;
  question: string;
  answer: AnswerValue;
}

/** Feature flags served by GET /api/config. */
export interface AppConfig {
  enableDelete: boolean;
}

export const FOLLOW_UP_STATUSES = [
  "Not Contacted",
  "Contacted",
  "Keen for church",
  "Keen for quiz night",
  "Keen for other",
  "Resolved",
  "Invalid",
] as const;

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

/** Follow-up workflow state, edited on /followups. */
export interface FollowUp {
  status: FollowUpStatus;
  contactee: string;
  notes: string;
}

/** A persisted play-through: game choices plus (eventually) survey answers. */
export interface GameResponse {
  id: string;
  choices: Choice[];
  survey: SurveyAnswer[];
  surveyCompletedAt: string | null;
  followUp: FollowUp;
  createdAt: string;
  updatedAt: string;
}
