package com.learnloop.backend.dto;

import java.time.LocalDateTime;

public class LikeDTO {
    private String userId;
    private String userName;
    private LocalDateTime likedAt;

    public LikeDTO(String userId, String userName, LocalDateTime likedAt) {
        this.userId = userId;
        this.userName = userName;
        this.likedAt = likedAt;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public LocalDateTime getLikedAt() { return likedAt; }
    public void setLikedAt(LocalDateTime likedAt) { this.likedAt = likedAt; }
    
}