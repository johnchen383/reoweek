import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../lib/mongodb.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDatabase()
    res.status(200).json({ status: 'ok', db: 'connected' })
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
