package com.docpulse.model;

public class Chunk {
    private String id;
    private String content;
    private int index;

    public Chunk() {}

    public Chunk(String id, String content, int index) {
        this.id = id;
        this.content = content;
        this.index = index;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getIndex() { return index; }
    public void setIndex(int index) { this.index = index; }
}
