import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const contacteeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
  },
  { timestamps: true },
)

export type Contactee = InferSchemaType<typeof contacteeSchema> & { id: string }

// Reuse the compiled model across warm serverless invocations.
export const ContacteeModel: Model<Contactee> =
  (mongoose.models.Contactee as Model<Contactee>) ||
  mongoose.model<Contactee>('Contactee', contacteeSchema)
