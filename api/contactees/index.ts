import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'
import { connectToDatabase } from '../../lib/mongodb.js'
import { ContacteeModel } from '../../lib/models/Contactee.js'

/**
 * /api/contactees — the managed list of people doing follow-up contact work.
 * All methods are admin only (x-admin-password header).
 *   GET    - list names (alphabetical)
 *   POST   - add a name: { name }
 *   DELETE - remove a name: ?name=...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET': {
        const contactees = await ContacteeModel.find().sort({ name: 1 }).lean()
        return res.status(200).json(contactees.map((c) => c.name))
      }

      case 'POST': {
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
        if (!name) return res.status(400).json({ message: 'name is required' })
        await ContacteeModel.updateOne({ name }, { name }, { upsert: true })
        return res.status(201).json({ name })
      }

      case 'DELETE': {
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

function isAuthorized(req: VercelRequest) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const provided = req.headers['x-admin-password']
  if (typeof provided !== 'string') return false
  const a = new TextEncoder().encode(provided)
  const b = new TextEncoder().encode(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
