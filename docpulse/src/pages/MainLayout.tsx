import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPage } from "./ChatPage";
import { UploadPage } from "./UploadPage";

export function MainLayout() {
  const [activeView, setActiveView] = useState<"chat" | "upload">("chat");

  const handleUploadComplete = () => {
    setActiveView("chat");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      {activeView === "chat" ? (
        <ChatPage />
      ) : (
        <UploadPage onUploadComplete={handleUploadComplete} />
      )}
    </div>
  );
}
