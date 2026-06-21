package com.docpulse.model;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class ChatRequest {
    @NotBlank
    private String query;

    private List<Message> history;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public List<Message> getHistory() { return history; }
    public void setHistory(List<Message> history) { this.history = history; }

    public static class Message {
        private String role;
        private String content;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
