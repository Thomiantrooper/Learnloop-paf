package com.learnloop.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "progress_updates")
public class ProgressUpdate {
    @Id
    private String id;
    private String type;
    private String title;
    private LocalDateTime date;
    private String description;
    private String userId;

    private String aiInsight;

    public String getAiInsight() {
        return aiInsight;
    }

    public void setAiInsight(String aiInsight) {
        this.aiInsight = aiInsight;
    }
    private String userReflection;

    public String getUserReflection() {
        return userReflection;
    }

    public void setUserReflection(String userReflection) {
        this.userReflection = userReflection;
    }
    private boolean allowEmail;

    public boolean isAllowEmail() {
        return allowEmail;
    }

    public void setAllowEmail(boolean allowEmail) {
        this.allowEmail = allowEmail;
    }
    private boolean sharedWithFriend;

    public boolean isSharedWithFriend() {
        return sharedWithFriend;
    }

    public void setSharedWithFriend(boolean sharedWithFriend) {
        this.sharedWithFriend = sharedWithFriend;
    }
    private String friendEmail;

    public String getFriendEmail() {
        return friendEmail;
    }

    public void setFriendEmail(String friendEmail) {
        this.friendEmail = friendEmail;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    private String inProgressType;

    public String getInProgressType() {
        return inProgressType;
    }

    public void setInProgressType(String inProgressType) {
        this.inProgressType = inProgressType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}