import { useState, type FormEvent } from 'react'
import type { ItemInput } from '../types'

interface ItemFormProps {
  onSubmit: (input: ItemInput) => Promise<void>
}

export function ItemForm({ onSubmit }: ItemFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || submitting) return

    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim() })
      setTitle('')
      setDescription('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="What needs doing?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
      />
      <button type="submit" disabled={!title.trim() || submitting}>
        {submitting ? 'Adding…' : 'Add item'}
      </button>
    </form>
  )
}
