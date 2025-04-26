package com.learnloop.backend.dto;

public class UpdateCommentRequest {
    private String userId;
    private String content;

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
