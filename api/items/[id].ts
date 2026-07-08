import type { VercelRequest, VercelResponse } from '@vercel/node'
import mongoose from 'mongoose'
import { connectToDatabase } from '../../lib/mongodb.js'
import { ItemModel } from '../../lib/models/Item.js'

/**
 * /api/items/:id
 *   GET    - fetch a single item
 *   PUT    - update an item
 *   DELETE - remove an item
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid item id' })
  }

  try {
    await connectToDatabase()

    switch (req.method) {
      case 'GET': {
        const item = await ItemModel.findById(id).lean()
        if (!item) return res.status(404).json({ message: 'Item not found' })
        return res.status(200).json(serialize(item))
      }

      case 'PUT': {
        const { title, description, completed } = req.body ?? {}
        const item = await ItemModel.findByIdAndUpdate(
          id,
          { title, description, completed },
          { new: true, runValidators: true },
        ).lean()
        if (!item) return res.status(404).json({ message: 'Item not found' })
        return res.status(200).json(serialize(item))
      }

      case 'DELETE': {
        const item = await ItemModel.findByIdAndDelete(id).lean()
        if (!item) return res.status(404).json({ message: 'Item not found' })
        return res.status(204).end()
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
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
