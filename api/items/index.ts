import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from '../../lib/mongodb.js'
import { ItemModel } from '../../lib/models/Item.js'

/**
 * /api/items
 *   GET  - list all items (newest first)
 *   POST - create a new item
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET': {
        const items = await ItemModel.find().sort({ createdAt: -1 }).lean()
        return res.status(200).json(items.map(serialize))
      }

      case 'POST': {
        const { title, description, completed } = req.body ?? {}
        const item = await ItemModel.create({ title, description, completed })
        return res.status(201).json(serialize(item.toJSON()))
      }

      default:
        res.setHeader('Allow', ['GET', 'POST'])
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
    title: doc.title,
    description: doc.description ?? '',
    completed: Boolean(doc.completed),
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
