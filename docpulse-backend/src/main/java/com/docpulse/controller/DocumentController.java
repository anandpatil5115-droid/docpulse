package com.docpulse.controller;

import com.docpulse.model.ChatRequest;
import com.docpulse.model.ChatResponse;
import com.docpulse.model.Document;
import com.docpulse.model.DocumentSummary;
import com.docpulse.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            Document doc = documentService.uploadDocument(file);
            return ResponseEntity.ok(doc);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentSummary>> getDocuments() {
        return ResponseEntity.ok(documentService.getDocumentSummaries());
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = documentService.answerQuery(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/documents")
    public ResponseEntity<Void> clearDocuments() {
        documentService.clearDocuments();
        return ResponseEntity.noContent().build();
    }
}
