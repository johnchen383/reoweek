import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../../lib/mongodb.js'
import { isDeleteEnabled } from '../../lib/flags.js'
import { isAdmin, resolveRole } from '../../lib/auth.js'
import { ResponseModel } from '../../lib/models/Response.js'

/**
 * /api/responses
 *   GET    - list responses (newest first) — admin sees all; a contactee
 *            (password = their name lowercased) sees only rows assigned
 *            to them
 *   POST   - create a response with the game choices (survey optional)
 *   DELETE - clear ALL responses — admin only
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET': {
        // Admin password or a contactee name both unlock the list; scoping a
        // contactee's view to their own rows is handled in the frontend.
        if (!(await resolveRole(req))) {
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
        if (!isAdmin(req)) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: any) {
  return {
    id: String(doc._id ?? doc.id),
    choices: doc.choices ?? [],
    survey: doc.survey ?? [],
    surveyCompletedAt: doc.surveyCompletedAt ?? null,
    followUp: {
      status: doc.followUp?.status ?? 'Not Contacted',
      contactee: doc.followUp?.contactee ?? '',
      notes: doc.followUp?.notes ?? '',
    },
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
