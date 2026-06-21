package com.docpulse.controller;

import com.docpulse.service.DocumentStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentStore documentStore;

    public DocumentController(DocumentStore documentStore) {
        this.documentStore = documentStore;
    }

    @GetMapping("/documents")
    public ResponseEntity<List<Map<String, Object>>> getDocuments() {
        List<Map<String, Object>> docs = documentStore.getAllDocuments().stream()
                .map(doc -> Map.<String, Object>of(
                        "id", doc.getId(),
                        "filename", doc.getFilename(),
                        "size", doc.getSize(),
                        "chunkCount", doc.getChunks().size(),
                        "uploadDate", doc.getUploadDate().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(docs);
    }
}
