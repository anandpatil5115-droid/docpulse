package com.docpulse.model;

import java.time.LocalDateTime;
import java.util.List;

public class Document {
    private String id;
    private String filename;
    private long size;
    private List<Chunk> chunks;
    private LocalDateTime uploadDate;

    public Document() {}

    public Document(String id, String filename, long size, List<Chunk> chunks) {
        this.id = id;
        this.filename = filename;
        this.size = size;
        this.chunks = chunks;
        this.uploadDate = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }

    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }

    public List<Chunk> getChunks() { return chunks; }
    public void setChunks(List<Chunk> chunks) { this.chunks = chunks; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
}
