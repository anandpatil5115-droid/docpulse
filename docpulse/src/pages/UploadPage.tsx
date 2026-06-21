import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadActivity {
  name: string;
  size: string;
  status: "uploading" | "completed" | "error";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function UploadPage({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploads, setUploads] = useState<UploadActivity[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const sizeStr =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(1)} KB`;

        setUploads((prev) => [...prev, { name: file.name, size: sizeStr, status: "uploading" }]);

        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch(`${API_URL}/api/upload`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Upload failed");

          setUploads((prev) =>
            prev.map((u) =>
              u.name === file.name ? { ...u, status: "completed" } : u
            )
          );

          setTimeout(() => onUploadComplete(), 500);
        } catch {
          setUploads((prev) =>
            prev.map((u) =>
              u.name === file.name ? { ...u, status: "error" } : u
            )
          );
        }
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024,
  });

  return (
    <div className="flex-1 p-8 overflow-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-blue-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">Drag and drop PDF files here</p>
        <p className="text-sm text-gray-400 mt-1">PDF (up to 50MB per file)</p>
        <Button variant="outline" className="mt-4" type="button">
          Browse files
        </Button>
      </div>

      {uploads.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Upload Activity</h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {uploads.map((upload) => (
              <div
                key={upload.name}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{upload.name}</p>
                    <p className="text-xs text-gray-500">{upload.size}</p>
                  </div>
                </div>
                {upload.status === "uploading" && (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                )}
                {upload.status === "completed" && (
                  <span className="text-xs text-green-600 font-medium">Completed</span>
                )}
                {upload.status === "error" && (
                  <span className="text-xs text-red-600 font-medium">Failed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
