package com.learnloop.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PostWithUserDTO {
    private String id;
    private String userId;
    private String userName;
    private String description;
    private List<String> mediaUrls;
    private LocalDateTime createdAt;
    private List<String> likes;
    private List<CommentDTO> comments;
    private String profilePicturePath;

    public PostWithUserDTO(String id, String userId, String userName, String description,
                           List<String> mediaUrls, LocalDateTime createdAt, List<String> likes,
                           List<CommentDTO> comments, String profilePicturePath) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.description = description;
        this.mediaUrls = mediaUrls;
        this.createdAt = createdAt;
        this.likes = likes;
        this.comments = comments;
        this.profilePicturePath = profilePicturePath;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getMediaUrls() { return mediaUrls; }
    public void setMediaUrls(List<String> mediaUrls) { this.mediaUrls = mediaUrls; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<String> getLikes() { return likes; }
    public void setLikes(List<String> likes) { this.likes = likes; }
    public List<CommentDTO> getComments() { return comments; }
    public void setComments(List<CommentDTO> comments) { this.comments = comments; }
    public String getProfilePicturePath() { return profilePicturePath; }
    public void setProfilePicturePath(String profilePicturePath) { this.profilePicturePath = profilePicturePath; }
}
