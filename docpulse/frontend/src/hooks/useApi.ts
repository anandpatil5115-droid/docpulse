const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function getDocuments() {
  const res = await fetch(`${API_URL}/api/documents`)
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json()
}

export async function sendChatMessage(query: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history }),
  })
  if (!res.ok) throw new Error('Chat request failed')
  return res.json()
}
