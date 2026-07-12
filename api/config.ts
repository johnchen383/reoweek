import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isDeleteEnabled } from '../lib/flags.js'

/**
 * GET /api/config — feature flags the frontend needs.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }
  return res.status(200).json({ enableDelete: isDeleteEnabled() })
}
