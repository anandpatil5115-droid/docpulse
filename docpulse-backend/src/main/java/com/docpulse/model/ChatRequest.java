package com.docpulse.model;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

public class ChatRequest {
    @NotBlank
    private String query;

    private List<Map<String, String>> history;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<Map<String, String>> getHistory() {
        return history;
    }

    public void setHistory(List<Map<String, String>> history) {
        this.history = history;
    }
}
