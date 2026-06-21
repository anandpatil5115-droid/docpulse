package com.docpulse.service;

import com.docpulse.model.Document;
import com.docpulse.model.DocumentSummary;
import com.docpulse.model.ChatRequest;
import com.docpulse.model.ChatResponse;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final Map<String, Document> documents = new ConcurrentHashMap<>();

    @Value("${LLM_API_KEY:#{null}}")
    private String llmApiKey;

    private static final int CHUNK_SIZE = 500;

    public Document uploadDocument(MultipartFile file) throws IOException {
        documents.clear();
        String text = extractText(file);
        List<String> chunks = chunkText(text);

        Document doc = new Document(file.getOriginalFilename(), file.getSize(), chunks);
        documents.put(file.getOriginalFilename(), doc);
        return doc;
    }

    public List<DocumentSummary> getDocumentSummaries() {
        return documents.values().stream()
                .map(d -> new DocumentSummary(d.getFilename(), d.getChunkCount()))
                .collect(Collectors.toList());
    }

    public void clearDocuments() {
        documents.clear();
    }

    public ChatResponse answerQuery(ChatRequest request) {
        String query = request.getQuery();

        List<ScoredChunk> scored = new ArrayList<>();
        for (Document doc : documents.values()) {
            for (String chunk : doc.getChunks()) {
                double sim = cosineSimilarity(query, chunk);
                int kw = keywordMatchCount(query, chunk);
                double score = sim + (kw * 0.2);
                scored.add(new ScoredChunk(chunk, doc.getFilename(), score));
            }
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));

        String focusedDoc = detectFocusedDocument(query, scored);
        List<ScoredChunk> selected;
        if (focusedDoc != null) {
            selected = scored.stream()
                    .filter(s -> s.filename.equals(focusedDoc))
                    .limit(3)
                    .collect(Collectors.toList());
        } else {
            selected = scored.stream().limit(3).collect(Collectors.toList());
        }

        if (selected.isEmpty() && !documents.isEmpty()) {
            selected = scored.stream().limit(3).collect(Collectors.toList());
        }

        List<String> sourceDocs = selected.stream()
                .map(s -> s.filename)
                .distinct()
                .collect(Collectors.toList());

        System.out.println("\n===== RAG RETRIEVAL =====");
        System.out.println("Query: " + query);
        System.out.println("Focused doc: " + focusedDoc);
        System.out.println("Selected chunks (" + selected.size() + "):");
        for (ScoredChunk s : selected) {
            System.out.println("  [" + s.filename + "] score=" + String.format("%.4f", s.score) + " text=" + s.text.substring(0, Math.min(120, s.text.length())));
        }

        String context = selected.isEmpty()
                ? "No relevant document chunks found."
                : selected.stream().map(s -> "[Source: " + s.filename + "] " + s.text)
                        .collect(Collectors.joining("\n\n"));

        String answer = callOpenAI(query, context, request.getHistory());

        return new ChatResponse(answer, sourceDocs);
    }

    private String detectFocusedDocument(String query, List<ScoredChunk> scored) {
        String q = query.toLowerCase();
        for (String filename : documents.keySet()) {
            String base = filename.toLowerCase();
            if (base.contains(".pdf")) base = base.substring(0, base.lastIndexOf('.'));
            String[] parts = base.replaceAll("[_-]", " ").split("\\s+");
            int nameMatches = 0;
            for (String part : parts) {
                if (part.length() > 2 && q.contains(part)) nameMatches++;
            }
            if (nameMatches >= 2) return filename;
        }

        if (scored.size() >= 2) {
            String top = scored.get(0).filename;
            long sameCount = scored.stream().limit(5).filter(s -> s.filename.equals(top)).count();
            if (sameCount >= 3) return top;
        }

        return null;
    }

    private static class ScoredChunk {
        final String text;
        final String filename;
        final double score;
        ScoredChunk(String text, String filename, double score) {
            this.text = text;
            this.filename = filename;
            this.score = score;
        }
    }

    private String extractText(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    private List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        String[] words = text.split("\\s+");
        StringBuilder sb = new StringBuilder();

        for (String word : words) {
            if (sb.length() + word.length() + 1 > CHUNK_SIZE && sb.length() > 0) {
                chunks.add(sb.toString().trim());
                sb = new StringBuilder();
            }
            sb.append(word).append(" ");
        }

        if (sb.length() > 0) {
            chunks.add(sb.toString().trim());
        }

        return chunks;
    }

    private int keywordMatchCount(String query, String chunk) {
        String[] queryWords = query.toLowerCase().split("\\s+");
        String chunkLower = chunk.toLowerCase();
        int matchCount = 0;
        for (String word : queryWords) {
            if (word.length() > 2 && chunkLower.contains(word)) {
                matchCount++;
            }
        }
        return matchCount;
    }

    private double cosineSimilarity(String query, String chunk) {
        Map<String, Integer> queryVec = termFrequency(query);
        Map<String, Integer> chunkVec = termFrequency(chunk);

        Set<String> allTerms = new HashSet<>(queryVec.keySet());
        allTerms.addAll(chunkVec.keySet());

        double dotProduct = 0;
        double queryMag = 0;
        double chunkMag = 0;

        for (String term : allTerms) {
            int qf = queryVec.getOrDefault(term, 0);
            int cf = chunkVec.getOrDefault(term, 0);
            dotProduct += qf * cf;
            queryMag += qf * qf;
            chunkMag += cf * cf;
        }

        if (queryMag == 0 || chunkMag == 0) return 0;
        return dotProduct / (Math.sqrt(queryMag) * Math.sqrt(chunkMag));
    }

    private Map<String, Integer> termFrequency(String text) {
        Map<String, Integer> freq = new HashMap<>();
        String[] words = text.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").split("\\s+");
        for (String word : words) {
            if (word.length() > 2) {
                freq.put(word, freq.getOrDefault(word, 0) + 1);
            }
        }
        return freq;
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String callOpenAI(String query, String context, List<Map<String, String>> history) {
        if (llmApiKey == null || llmApiKey.isEmpty()) {
            return "Error: LLM_API_KEY environment variable not set. Set it and restart the server.";
        }

        try {
            java.net.URL url = new java.net.URL("https://api.groq.com/openai/v1/chat/completions");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + llmApiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String systemMsg = "You are a helpful assistant. Answer the user's question in a clear, concise paragraph using only the context below. Do not repeat the context, just answer the question.";

            String userContent = "Context:\n" + context + "\n\nQuestion: " + query;

            List<Map<String, String>> messages = new ArrayList<>();

            Map<String, String> sys = new HashMap<>();
            sys.put("role", "system");
            sys.put("content", systemMsg);
            messages.add(sys);

            if (history != null) {
                int start = Math.max(0, history.size() - 10);
                for (int i = start; i < history.size(); i++) {
                    messages.add(history.get(i));
                }
            }

            Map<String, String> usr = new HashMap<>();
            usr.put("role", "user");
            usr.put("content", userContent);
            messages.add(usr);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            byte[] requestBytes = objectMapper.writeValueAsBytes(requestBody);
            System.out.println("\n===== GROQ API REQUEST =====");
            System.out.println(new String(requestBytes, "UTF-8"));
            conn.getOutputStream().write(requestBytes);

            int status = conn.getResponseCode();
            java.io.InputStream responseStream = (status >= 200 && status < 300) ? conn.getInputStream() : conn.getErrorStream();
            Scanner scanner = new Scanner(responseStream, "UTF-8").useDelimiter("\\A");
            String responseBody = scanner.hasNext() ? scanner.next() : "";

            System.out.println("\n===== GROQ API RESPONSE =====");
            System.out.println("Status: " + status);
            System.out.println(responseBody);

            if (status == 200) {
                Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    if (message != null && message.get("content") != null) {
                        String answer = (String) message.get("content");
                        System.out.println("\n===== GROQ ANSWER =====");
                        System.out.println(answer);
                        return answer;
                    }
                }
            }

            String error = "Groq API error (HTTP " + status + "): " + responseBody;
            System.out.println("\n===== GROQ API ERROR =====");
            System.out.println(error);
            return "Error calling Groq: " + error;
        } catch (Exception e) {
            System.out.println("\n===== GROQ API EXCEPTION =====");
            e.printStackTrace();
            return "Error calling Groq: " + e.getMessage();
        }
    }

    private String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String simulateAnswer(String query, String context) {
        if (context.contains("No relevant document chunks")) {
            return "I don't have any documents indexed yet. Please upload some PDF files first.";
        }

        String[] sentences = context.split("\\. ");
        List<String> relevant = new ArrayList<>();
        String[] queryWords = query.toLowerCase().split("\\s+");

        for (String sentence : sentences) {
            String s = sentence.toLowerCase();
            for (String word : queryWords) {
                if (word.length() > 3 && s.contains(word)) {
                    relevant.add(sentence);
                    break;
                }
            }
        }

        if (relevant.isEmpty() && sentences.length > 0) {
            relevant.add(sentences[0]);
        }

        if (relevant.isEmpty()) {
            return "Based on the documents, I couldn't find specific information matching your query. " +
                    "Please try asking a different question.";
        }

        return "Based on the uploaded documents: " + String.join(". ", relevant) + ".";
    }
}
