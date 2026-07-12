import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'
import mongoose from 'mongoose'
import { connectToDatabase } from '../../lib/mongodb.js'
import { ResponseModel } from '../../lib/models/Response.js'

/**
 * /api/responses/:id
 *   GET - fetch a single response — admin only
 *   PUT - attach survey answers to an existing response
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid response id' })
  }

  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET': {
        if (!isAuthorized(req)) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
        const response = await ResponseModel.findById(id).lean()
        if (!response) return res.status(404).json({ message: 'Response not found' })
        return res.status(200).json(serialize(response))
      }

      case 'PUT': {
        const { survey } = req.body ?? {}
        if (!Array.isArray(survey)) {
          return res.status(400).json({ message: 'survey must be an array of answers' })
        }
        const response = await ResponseModel.findByIdAndUpdate(
          id,
          { survey, surveyCompletedAt: new Date() },
          { new: true, runValidators: true },
        ).lean()
        if (!response) return res.status(404).json({ message: 'Response not found' })
        return res.status(200).json(serialize(response))
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        return res.status(405).json({ message: `Method ${req.method} not allowed` })
    }
  } catch (err) {
    return handleError(res, err)
  }
}

function isAuthorized(req: VercelRequest) {
  const expected = process.env.ADMIN_PASSWORD
  // No password configured → admin access stays locked.
  if (!expected) return false
  const provided = req.headers['x-admin-password']
  if (typeof provided !== 'string') return false
  const a = new TextEncoder().encode(provided)
  const b = new TextEncoder().encode(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: any) {
  return {
    id: String(doc._id ?? doc.id),
    choices: doc.choices ?? [],
    survey: doc.survey ?? [],
    surveyCompletedAt: doc.surveyCompletedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

function handleError(res: VercelResponse, err: unknown) {
  if (err instanceof Error && err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }
  return res.status(500).json({
    message: err instanceof Error ? err.message : 'Internal server error',
  })
}
