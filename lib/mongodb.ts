import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Missing MONGODB_URI environment variable. Copy .env.example to .env and set it.',
  )
}

/**
 * Serverless functions can be invoked concurrently and reuse warm instances,
 * so we cache the connection on the global object to avoid opening a new
 * connection on every invocation (which quickly exhausts the connection pool).
 */
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var _mongoose: MongooseCache | undefined
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null }
global._mongoose = cached

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, {
        bufferCommands: false,
      })
      .then((m) => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}
