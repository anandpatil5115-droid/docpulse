package com.docpulse.service;

import com.docpulse.model.Chunk;
import com.docpulse.model.Document;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DocumentStore {
    private final Map<String, Document> documents = new ConcurrentHashMap<>();

    public void addDocument(Document document) {
        documents.put(document.getId(), document);
    }

    public Document getDocument(String id) {
        return documents.get(id);
    }

    public List<Document> getAllDocuments() {
        return new ArrayList<>(documents.values());
    }

    public List<ChunkWithSource> getAllChunksWithSource() {
        List<ChunkWithSource> result = new ArrayList<>();
        for (Document doc : documents.values()) {
            for (Chunk chunk : doc.getChunks()) {
                result.add(new ChunkWithSource(doc.getFilename(), chunk.getContent()));
            }
        }
        return result;
    }

    public static class ChunkWithSource {
        private final String documentName;
        private final String content;

        public ChunkWithSource(String documentName, String content) {
            this.documentName = documentName;
            this.content = content;
        }

        public String getDocumentName() { return documentName; }
        public String getContent() { return content; }
    }
}
