export interface Item {
  id: string
  title: string
  description: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type ItemInput = {
  title: string
  description?: string
  completed?: boolean
}
