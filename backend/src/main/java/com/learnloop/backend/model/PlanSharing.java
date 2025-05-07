package com.learnloop.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "plan_sharing")
public class PlanSharing {
    @Id
    private String id;
    private String userId;
    private String title;
    private List<String> topics = new ArrayList<>();
    private String description;
    private List<String> resources = new ArrayList<>(); 
    private LocalDateTime timelineStart; 
    private LocalDateTime timelineEnd; 
    private boolean isFavorite; 
    private LocalDateTime date; 

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getResources() {
        return resources;
    }

    public void setResources(List<String> resources) {
        this.resources = resources;
    }

    public LocalDateTime getTimelineStart() {
        return timelineStart;
    }

    public void setTimelineStart(LocalDateTime timelineStart) {
        this.timelineStart = timelineStart;
    }

    public LocalDateTime getTimelineEnd() {
        return timelineEnd;
    }

    public void setTimelineEnd(LocalDateTime timelineEnd) {
        this.timelineEnd = timelineEnd;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    @JsonProperty("isFavorite") 
    public boolean getIsFavorite() { return isFavorite; }


    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}