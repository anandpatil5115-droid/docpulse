export interface User {
  name: string
  email: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface DocumentInfo {
  id: string
  filename: string
  size: number
  chunkCount: number
  uploadDate: string
}

export interface UploadStatus {
  filename: string
  size: number
  status: 'uploading' | 'processing' | 'indexing' | 'completed' | 'error'
  error?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  isFollowUp?: boolean
  timestamp: string
}

export interface ChatRequest {
  query: string
  history: { role: string; content: string }[]
}

export interface ChatResponse {
  answer: string
  sources: string[]
}
