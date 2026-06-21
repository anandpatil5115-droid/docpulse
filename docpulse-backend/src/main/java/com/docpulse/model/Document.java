package com.docpulse.model;

import java.util.List;

public class Document {
    private String filename;
    private long fileSize;
    private List<String> chunks;

    public Document() {}

    public Document(String filename, long fileSize, List<String> chunks) {
        this.filename = filename;
        this.fileSize = fileSize;
        this.chunks = chunks;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public List<String> getChunks() {
        return chunks;
    }

    public void setChunks(List<String> chunks) {
        this.chunks = chunks;
    }

    public int getChunkCount() {
        return chunks != null ? chunks.size() : 0;
    }
}
