import { useState, useEffect, useRef } from "react";
import { Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  isFirst?: boolean;
  sources?: string[];
}

const suggestions = [
  "Summarize the key findings",
  "What are the main topics?",
  "Compare the documents",
  "Extract important dates",
];

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setHasSent(true);
    setLoading(true);

    const history = messages.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, history }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      const isFirst = messages.filter((m) => m.sender === "bot").length === 0;

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: "bot",
        isFirst,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: "bot",
        sources: [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!hasSent) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <div className="relative">
              <FileText className="h-16 w-16 text-primary" />
              <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">AI-Powered Workspace Chat</h2>
          <p className="text-gray-500 mb-8">
            Upload PDF files to build memory chunks, then ask queries. The pipeline retrieves
            document contextual snippets to compose answers locally.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-left px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-8 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="pr-12 h-12 text-base"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-10 w-10"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-auto p-8 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                msg.sender === "user"
                  ? "bg-primary text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              {msg.sender === "bot" && (
                <span className="inline-block text-xs font-semibold text-primary mb-1 uppercase tracking-wide">
                  {msg.isFirst ? "QA" : "FOLLOW-UP"}
                </span>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              {msg.sender === "bot" && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400 font-medium mb-1">Sources:</p>
                  {msg.sources.map((src, i) => (
                    <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {src}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="relative max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up question..."
            className="pr-12 h-12 text-base"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1 h-10 w-10"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
