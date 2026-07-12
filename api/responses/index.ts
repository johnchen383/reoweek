import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'
import { connectToDatabase } from '../../lib/mongodb.js'
import { isDeleteEnabled } from '../../lib/flags.js'
import { ResponseModel } from '../../lib/models/Response.js'

/**
 * /api/responses
 *   GET    - list all responses (newest first) — admin only
 *   POST   - create a response with the game choices (survey optional)
 *   DELETE - clear ALL responses — admin only
 *
 * Admin requests must send the ADMIN_PASSWORD env value in an
 * `x-admin-password` header.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET': {
        if (!isAuthorized(req)) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
        const responses = await ResponseModel.find()
          .sort({ createdAt: -1 })
          .lean()
        return res.status(200).json(responses.map(serialize))
      }

      case 'POST': {
        const { choices, survey } = req.body ?? {}
        const response = await ResponseModel.create({
          choices,
          survey: survey ?? [],
          surveyCompletedAt: Array.isArray(survey) && survey.length > 0 ? new Date() : null,
        })
        return res.status(201).json(serialize(response.toObject()))
      }

      case 'DELETE': {
        if (!isAuthorized(req)) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
        if (!isDeleteEnabled()) {
          return res.status(403).json({ message: 'Deleting data is disabled (ENABLE_DELETE=false)' })
        }
        await ResponseModel.deleteMany({})
        return res.status(204).end()
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
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
