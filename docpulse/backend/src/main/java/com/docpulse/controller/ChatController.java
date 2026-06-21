package com.docpulse.controller;

import com.docpulse.model.ChatRequest;
import com.docpulse.model.ChatResponse;
import com.docpulse.service.RagService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final RagService ragService;

    public ChatController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        List<Map<String, String>> history = request.getHistory() != null
                ? request.getHistory().stream()
                    .map(msg -> Map.<String, String>of("role", msg.getRole(), "content", msg.getContent()))
                    .collect(Collectors.toList())
                : List.of();

        ChatResponse response = ragService.answerQuery(request.getQuery(), history);
        return ResponseEntity.ok(response);
    }
}
