import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../../lib/mongodb.js'
import { isAdmin, resolveRole } from '../../lib/auth.js'
import { ContacteeModel } from '../../lib/models/Contactee.js'

/**
 * /api/contactees — the managed list of people doing follow-up contact work.
 *   GET    - list names (alphabetical) — admin or any contactee
 *   POST   - add a name: { name } — admin only
 *   DELETE - remove a name: ?name=... — admin only
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET': {
        if (!(await resolveRole(req))) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
        const contactees = await ContacteeModel.find().sort({ name: 1 }).lean()
        return res.status(200).json(contactees.map((c) => c.name))
      }

      case 'POST': {
        if (!isAdmin(req)) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
        if (!name) return res.status(400).json({ message: 'name is required' })
        await ContacteeModel.updateOne({ name }, { name }, { upsert: true })
        return res.status(201).json({ name })
      }

      case 'DELETE': {
        if (!isAdmin(req)) {
          return res.status(401).json({ message: 'Unauthorized' })
        }
        const { name } = req.query
        if (typeof name !== 'string' || !name.trim()) {
          return res.status(400).json({ message: 'name query parameter is required' })
        }
        await ContacteeModel.deleteOne({ name: name.trim() })
        return res.status(204).end()
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).json({ message: `Method ${req.method} not allowed` })
    }
  } catch (err) {
    return res.status(500).json({
      message: err instanceof Error ? err.message : 'Internal server error',
    })
  }
}
