package com.docpulse.controller;

import com.docpulse.model.Chunk;
import com.docpulse.model.Document;
import com.docpulse.service.DocumentStore;
import com.docpulse.service.PdfService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final PdfService pdfService;
    private final DocumentStore documentStore;

    public FileUploadController(PdfService pdfService, DocumentStore documentStore) {
        this.pdfService = pdfService;
        this.documentStore = documentStore;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String text = pdfService.extractText(file.getInputStream());
            List<Chunk> chunks = pdfService.chunkText(text, 500);
            Document document = new Document(
                    UUID.randomUUID().toString(),
                    file.getOriginalFilename(),
                    file.getSize(),
                    chunks
            );
            documentStore.addDocument(document);
            return ResponseEntity.ok(Map.of(
                    "id", document.getId(),
                    "filename", document.getFilename(),
                    "chunkCount", chunks.size(),
                    "message", "File uploaded and indexed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to process PDF: " + e.getMessage()
            ));
        }
    }
}
