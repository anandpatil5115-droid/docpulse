package com.docpulse.model;

public class DocumentSummary {
    private String filename;
    private int chunkCount;

    public DocumentSummary() {}

    public DocumentSummary(String filename, int chunkCount) {
        this.filename = filename;
        this.chunkCount = chunkCount;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public int getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(int chunkCount) {
        this.chunkCount = chunkCount;
    }
}
