package com.docpulse.service;

import com.docpulse.model.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final DocumentStore documentStore;
    private final RestTemplate restTemplate;

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${openai.max-tokens:1024}")
    private int maxTokens;

    @Value("${openai.temperature:0.7}")
    private double temperature;

    public RagService(DocumentStore documentStore) {
        this.documentStore = documentStore;
        this.restTemplate = new RestTemplate();
    }

    public ChatResponse answerQuery(String query, List<Map<String, String>> history) {
        List<DocumentStore.ChunkWithSource> allChunks = documentStore.getAllChunksWithSource();

        if (allChunks.isEmpty()) {
            return new ChatResponse(
                "No documents have been uploaded yet. Please upload PDF documents first.",
                Collections.emptyList()
            );
        }

        List<DocumentStore.ChunkWithSource> relevantChunks = retrieveRelevantChunks(query, allChunks, 5);

        String context = relevantChunks.stream()
                .map(c -> "[Source: " + c.getDocumentName() + "] " + c.getContent())
                .collect(Collectors.joining("\n\n"));

        Set<String> sources = relevantChunks.stream()
                .map(DocumentStore.ChunkWithSource::getDocumentName)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        String answer = callOpenAI(query, context, history);

        return new ChatResponse(answer, new ArrayList<>(sources));
    }

    private List<DocumentStore.ChunkWithSource> retrieveRelevantChunks(
            String query, List<DocumentStore.ChunkWithSource> chunks, int topK) {

        String[] queryTerms = query.toLowerCase().split("\\s+");

        return chunks.stream()
                .map(chunk -> {
                    double score = computeRelevanceScore(queryTerms, chunk.getContent().toLowerCase());
                    return new AbstractMap.SimpleEntry<>(chunk, score);
                })
                .filter(entry -> entry.getValue() > 0)
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(topK)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double computeRelevanceScore(String[] queryTerms, String content) {
        double score = 0.0;
        for (String term : queryTerms) {
            if (term.length() < 3) continue;
            int count = 0;
            int index = 0;
            while ((index = content.indexOf(term, index)) != -1) {
                count++;
                index += term.length();
            }
            score += count;
        }
        return score;
    }

    private String callOpenAI(String query, String context, List<Map<String, String>> history) {
        try {
            String url = "https://api.openai.com/v1/chat/completions";

            List<Map<String, String>> messages = new ArrayList<>();

            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", "You are a helpful assistant that answers questions based on the provided document context. Use the context to answer the user's question. If the context does not contain relevant information, say so. Always cite the source document names when referencing information from the context.\n\nContext:\n" + context);
            messages.add(systemMsg);

            for (Map<String, String> msg : history) {
                Map<String, String> histMsg = new HashMap<>();
                histMsg.put("role", msg.get("role"));
                histMsg.put("content", msg.get("content"));
                messages.add(histMsg);
            }

            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", query);
            messages.add(userMsg);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) choice.get("message");
                    return message.get("content");
                }
            }

            return "Sorry, I couldn't generate an answer at this time.";
        } catch (Exception e) {
            return "I encountered an error connecting to the AI service. Error: " + e.getMessage();
        }
    }
}
