import { useCallback, useEffect, useState } from 'react'
import { api } from './api/client'
import { ItemForm } from './components/ItemForm'
import type { Item, ItemInput } from './types'

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setError(null)
    try {
      setItems(await api.listItems())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  async function handleCreate(input: ItemInput) {
    const created = await api.createItem(input)
    setItems((prev) => [created, ...prev])
  }

  async function handleToggle(item: Item) {
    const updated = await api.updateItem(item.id, {
      title: item.title,
      description: item.description,
      completed: !item.completed,
    })
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
  }

  async function handleDelete(id: string) {
    await api.deleteItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>reoweek</h1>
        <p>A MERN + Vite + TypeScript starter. Edit these items to get going.</p>
      </header>

      <ItemForm onSubmit={handleCreate} />

      {error && <p className="app__error">⚠️ {error}</p>}

      {loading ? (
        <p className="app__status">Loading…</p>
      ) : items.length === 0 ? (
        <p className="app__status">No items yet. Add your first one above.</p>
      ) : (
        <ul className="item-list">
          {items.map((item) => (
            <li
              key={item.id}
              className={`item${item.completed ? ' item--done' : ''}`}
            >
              <label className="item__main">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggle(item)}
                />
                <span className="item__text">
                  <span className="item__title">{item.title}</span>
                  {item.description && (
                    <span className="item__description">{item.description}</span>
                  )}
                </span>
              </label>
              <button
                className="item__delete"
                onClick={() => handleDelete(item.id)}
                aria-label="Delete item"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
