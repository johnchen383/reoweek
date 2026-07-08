import type { Item, ItemInput } from '../types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      // response had no JSON body
    }
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  listItems: () => request<Item[]>('/items'),
  getItem: (id: string) => request<Item>(`/items/${id}`),
  createItem: (input: ItemInput) =>
    request<Item>('/items', { method: 'POST', body: JSON.stringify(input) }),
  updateItem: (id: string, input: ItemInput) =>
    request<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteItem: (id: string) =>
    request<void>(`/items/${id}`, { method: 'DELETE' }),
}
