import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const choiceSchema = new Schema(
  {
    pairId: { type: String, required: true, trim: true },
    chosen: { type: String, required: true, trim: true, maxlength: 200 },
    other: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { _id: false },
)

const surveyAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
)

export const FOLLOW_UP_STATUSES = [
  'Not Contacted',
  'Contacted',
  'Followed up',
  'Resolved',
  'Bestie',
] as const

const followUpSchema = new Schema(
  {
    status: {
      type: String,
      enum: FOLLOW_UP_STATUSES,
      default: 'Not Contacted',
    },
    contactee: { type: String, trim: true, default: '', maxlength: 200 },
    notes: { type: String, trim: true, default: '', maxlength: 2000 },
  },
  { _id: false },
)

const responseSchema = new Schema(
  {
    choices: {
      type: [choiceSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one choice is required',
      },
    },
    survey: {
      type: [surveyAnswerSchema],
      default: [],
    },
    surveyCompletedAt: {
      type: Date,
      default: null,
    },
    followUp: {
      type: followUpSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
)

export type Response = InferSchemaType<typeof responseSchema> & { id: string }

// Reuse the compiled model across warm serverless invocations to avoid the
// "OverwriteModelError" that occurs when a model is defined more than once.
export const ResponseModel: Model<Response> =
  (mongoose.models.Response as Model<Response>) ||
  mongoose.model<Response>('Response', responseSchema)
