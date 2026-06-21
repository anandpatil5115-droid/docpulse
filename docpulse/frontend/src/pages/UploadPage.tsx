import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { uploadDocument, getDocuments } from '@/hooks/useApi'
import type { UploadStatus, DocumentInfo } from '@/types'

interface UploadPageProps {
  onUploadComplete: () => void
  onDocumentsUpdate: (docs: DocumentInfo[]) => void
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage({ onUploadComplete, onDocumentsUpdate }: UploadPageProps) {
  const [uploads, setUploads] = useState<UploadStatus[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploads(prev => [...prev, {
        filename: file.name,
        size: file.size,
        status: 'error',
        error: 'Only PDF files are supported',
      }])
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploads(prev => [...prev, {
        filename: file.name,
        size: file.size,
        status: 'error',
        error: 'File exceeds 50MB limit',
      }])
      return
    }

    const id = Date.now().toString()
    setUploads(prev => [...prev, { filename: file.name, size: file.size, status: 'uploading' }])

    try {
      await uploadDocument(file)
      setUploads(prev => prev.map(u =>
        u.filename === file.name && u.status === 'uploading'
          ? { ...u, status: 'completed' }
          : u
      ))
      const docs = await getDocuments()
      onDocumentsUpdate(docs)
      onUploadComplete()
    } catch {
      setUploads(prev => prev.map(u =>
        u.filename === file.name && u.status === 'uploading'
          ? { ...u, status: 'error', error: 'Upload failed' }
          : u
      ))
    }
  }, [onUploadComplete, onDocumentsUpdate])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(processFile)
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(processFile)
    if (inputRef.current) inputRef.current.value = ''
  }, [processFile])

  const statusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'indexing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary-50 p-3">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>
          <p className="text-gray-700 font-medium mb-1">Drag and drop PDF files here</p>
          <p className="text-sm text-gray-400 mb-4">PDF (up to 50MB per file)</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Browse files
          </Button>
        </div>

        {uploads.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Activity</h2>
            <div className="space-y-2">
              {uploads.map((upload, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
                  <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{upload.filename}</p>
                    <p className="text-xs text-gray-400">{formatSize(upload.size)}</p>
                  </div>
                  <div className="shrink-0">
                    {upload.status === 'error' ? (
                      <span className="text-xs text-red-500">{upload.error}</span>
                    ) : (
                      statusIcon(upload.status)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
