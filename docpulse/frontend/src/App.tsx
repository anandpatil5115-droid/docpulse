import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'
import ChatPage from '@/pages/ChatPage'
import UploadPage from '@/pages/UploadPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import { getDocuments } from '@/hooks/useApi'
import type { DocumentInfo } from '@/types'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppLayout() {
  const [activeView, setActiveView] = useState<'chat' | 'upload'>('chat')
  const [documents, setDocuments] = useState<DocumentInfo[]>([])

  useEffect(() => {
    getDocuments()
      .then(docs => setDocuments(docs))
      .catch(() => {})
  }, [])

  const handleUploadComplete = () => {
    setActiveView('chat')
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        documents={documents}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'chat' ? (
          <ChatPage />
        ) : (
          <UploadPage
            onUploadComplete={handleUploadComplete}
            onDocumentsUpdate={setDocuments}
          />
        )}
      </main>
    </div>
  )
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
