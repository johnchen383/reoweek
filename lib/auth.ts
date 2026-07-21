import type { VercelRequest } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'
import { ContacteeModel } from './models/Contactee.js'

function safeEqual(a: string, b: string) {
  const ea = new TextEncoder().encode(a)
  const eb = new TextEncoder().encode(b)
  return ea.length === eb.length && timingSafeEqual(ea, eb)
}

/** True when the request carries the ADMIN_PASSWORD env value. */
export function isAdmin(req: VercelRequest) {
  const expected = process.env.ADMIN_PASSWORD
  // No password configured → admin access stays locked.
  if (!expected) return false
  const provided = req.headers['x-admin-password']
  return typeof provided === 'string' && safeEqual(provided, expected)
}

export type Role = { role: 'admin' } | { role: 'contactee'; name: string }

/** "Jane Doe" → "janedoe": a contactee's password is their name with all
 * spaces dropped, lowercased. */
function normalizeName(s: string) {
  return s.replace(/\s+/g, '').toLowerCase()
}

/**
 * Resolve the request to admin or a contactee. Requires an open DB connection.
 */
export async function resolveRole(req: VercelRequest): Promise<Role | null> {
  if (isAdmin(req)) return { role: 'admin' }
  const provided = req.headers['x-admin-password']
  if (typeof provided !== 'string') return null
  const wanted = normalizeName(provided)
  if (!wanted) return null
  const contactees = await ContacteeModel.find().lean()
  const match = contactees.find((c) => normalizeName(c.name) === wanted)
  return match ? { role: 'contactee', name: match.name } : null
}
