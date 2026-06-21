import { FileText, MessageSquare, LogOut, FileIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Separator } from '@/components/ui/separator'
import type { DocumentInfo } from '@/types'

interface SidebarProps {
  activeView: 'chat' | 'upload'
  setActiveView: (view: 'chat' | 'upload') => void
  documents: DocumentInfo[]
}

export default function Sidebar({ activeView, setActiveView, documents }: SidebarProps) {
  const { user, logout } = useAuth()

  const navItems = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'upload' as const, label: 'Upload Documents', icon: FileText },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <FileIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-gray-900">DocPulse</span>
        </div>
        <p className="text-xs font-semibold tracking-widest text-primary ml-8">INTELLIGENCE RAG</p>
      </div>

      <nav className="px-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeView === item.id
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <Separator className="mx-3 my-4" />

      <div className="px-5 flex-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Indexed Corpus</h3>
        <div className="space-y-2">
          {documents.length === 0 ? (
            <p className="text-xs text-gray-400">No documents uploaded yet</p>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex items-start gap-2">
                <FileIcon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">{doc.filename}</p>
                  <p className="text-xs text-gray-400">{doc.chunkCount} chunks</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="mb-3 px-1">
            <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={() => { logout() }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
