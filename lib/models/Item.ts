import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id
        delete ret._id
      },
    },
  },
)

export type Item = InferSchemaType<typeof itemSchema> & { id: string }

// Reuse the compiled model across warm serverless invocations to avoid the
// "OverwriteModelError" that occurs when a model is defined more than once.
export const ItemModel: Model<Item> =
  (mongoose.models.Item as Model<Item>) ||
  mongoose.model<Item>('Item', itemSchema)
