import { FileText, MessageSquare, Upload, LogOut, BookOpen, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Document {
  filename: string;
  chunkCount: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface SidebarProps {
  activeView: "chat" | "upload";
  onNavigate: (view: "chat" | "upload") => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { logout } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/documents`);
        if (res.ok) {
          setDocuments(await res.json());
        }
      } catch {
        // ignore
      }
    };
    fetchDocs();
    const interval = setInterval(fetchDocs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-gray-900">DocPulse</span>
        </div>
        <p className="text-xs font-semibold text-primary tracking-widest ml-8">INTELLIGENCE RAG</p>
      </div>

      <nav className="px-4 flex-1">
        <button
          onClick={() => onNavigate("chat")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors mb-1",
            activeView === "chat"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <MessageSquare className="h-5 w-5" />
          Chat
        </button>
        <button
          onClick={() => onNavigate("upload")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
            activeView === "upload"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Upload className="h-5 w-5" />
          Upload Documents
        </button>
      </nav>

      <div className="px-4 mt-6">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Indexed Corpus
          </p>
          {documents.length > 0 && (
            <button
              onClick={async () => {
                await fetch(`${API_URL}/api/documents`, { method: "DELETE" });
                setDocuments([]);
              }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              title="Clear All Documents"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </button>
          )}
        </div>
        {documents.length > 0 && (
          <div className="space-y-1">
            {documents.map((doc) => (
              <div key={doc.filename} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="truncate flex-1">{doc.filename}</span>
                <span className="text-xs text-gray-400">{doc.chunkCount} chunks</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
