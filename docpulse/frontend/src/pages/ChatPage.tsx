import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { sendChatMessage } from '@/hooks/useApi'
import type { ChatMessage } from '@/types'

interface ChatPageProps {
  onSendMessage?: () => void
}

const suggestions = [
  'Summarize the key findings',
  'What are the main topics?',
  'Compare the documents',
  'Extract important dates',
]

export default function ChatPage({ onSendMessage }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (query: string) => {
    if (!query.trim() || isLoading) return
    setInput('')
    onSendMessage?.()

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const data = await sendChatMessage(query, history)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        isFollowUp: messages.some(m => m.role === 'assistant'),
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please make sure the backend server is running.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Workspace Chat</h1>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Upload PDF files to build memory chunks, then ask queries. The pipeline retrieves document contextual snippets to compose answers locally.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
          {suggestions.map(suggestion => (
            <button
              key={suggestion}
              onClick={() => handleSend(suggestion)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="fixed bottom-0 left-72 right-0 p-4 bg-background">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
              placeholder="Ask a question about your documents..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button onClick={() => handleSend(input)} disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => {
            const isAssistant = msg.role === 'assistant'
            return (
              <div key={msg.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${isAssistant ? 'order-1' : 'order-1'}`}>
                  {isAssistant && (
                    <div className="mb-2">
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {msg.isFollowUp ? 'FOLLOW-UP' : 'QA'}
                      </span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 ${
                    isAssistant
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-primary text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {isAssistant && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {msg.sources.map((source, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500 border border-gray-200">
                          <FileText className="h-3 w-3 mr-1" />
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(input)}
            placeholder="Ask a question about your documents..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button onClick={() => handleSend(input)} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
