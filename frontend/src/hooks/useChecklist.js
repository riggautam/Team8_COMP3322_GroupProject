import { useEffect, useState } from 'react'
import requestJson from './requestJson.js'

function useChecklist() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadItems() {
      const result = await requestJson('/api/checklist')
      setError(result.error)
      setItems(result.data?.data ?? [])
      setIsLoading(false)
    }
    loadItems()
  }, [])

  async function addItem(label) {
    const result = await requestJson('/api/checklist', {
      method: 'POST',
      body: { label },
    })
    setError(result.error)
    if (result.error) return false

    setItems((currentItems) => [...currentItems, result.data.data])
    return true
  }

  async function toggleItem(item) {
    const isDone = !item.isDone
    const result = await requestJson(`/api/checklist/${item.id}`, {
      method: 'PATCH',
      body: { isDone },
    })
    setError(result.error)
    if (result.error) return

    setItems((currentItems) => currentItems.map((other) => (
      other.id === item.id ? { ...other, isDone } : other
    )))
  }

  async function removeItem(id) {
    const result = await requestJson(`/api/checklist/${id}`, { method: 'DELETE' })
    setError(result.error)
    if (result.error) return

    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  return { items, error, isLoading, addItem, toggleItem, removeItem }
}

export default useChecklist
