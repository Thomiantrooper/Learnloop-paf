package com.learnloop.backend.controller;

import com.learnloop.backend.model.NotificationHistory;
import com.learnloop.backend.model.Post;
import com.learnloop.backend.model.User;
import com.learnloop.backend.repository.NotificationHistoryRepository;
import com.learnloop.backend.repository.PostRepository;
import com.learnloop.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user-notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class UserNotificationController {

    private final UserRepository userRepository;
    private final NotificationHistoryRepository historyRepo;
    private final PostRepository postRepository;

    public UserNotificationController(UserRepository userRepository,
                                      NotificationHistoryRepository historyRepo,
                                      PostRepository postRepository) {
        this.userRepository = userRepository;
        this.historyRepo = historyRepo;
        this.postRepository = postRepository;
    }

    @GetMapping("/{userId}")
    public List<Map<String, Object>> getUserNotifications(@PathVariable String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return new ArrayList<>();

        User user = userOpt.get();
        List<NotificationHistory> readHistory = historyRepo.findByUserId(userId);
        Set<String> readIds = readHistory.stream()
                .map(NotificationHistory::getNotificationId)
                .collect(Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();

        // 1. Followers
        if (user.getFollowers() != null) {
            for (String followerId : user.getFollowers()) {
                if (followerId != null) {
                    String id = "follow:" + followerId;
                    String followerName = userRepository.findById(followerId)
                            .map(User::getName)
                            .orElse("Someone");

                    result.add(Map.of(
                            "id", id,
                            "type", "follow",
                            "message", followerName + " followed you",
                            "read", readIds.contains(id)
                    ));
                }
            }
        }

        // 2. Likes and 3. Comments from user's posts
        List<Post> userPosts = postRepository.findByUserId(userId);
        for (Post post : userPosts) {
            // Likes
            if (post.getLikes() != null) {
                for (String likerId : post.getLikes()) {
                    String id = "like:" + post.getId() + ":" + likerId;
                    if (!readIds.contains(id)) {
                        String likerName = userRepository.findById(likerId)
                                .map(User::getName)
                                .orElse("Someone");
                        result.add(Map.of(
                                "id", id,
                                "type", "like",
                                "message", likerName + " liked your post",
                                "read", false
                        ));
                    }
                }
            }

            // Comments
            if (post.getComments() != null) {
                for (Post.Comment comment : post.getComments()) {
                    String commenterId = comment.getUserId();
                    String id = "comment:" + post.getId() + ":" + comment.getId();
                    if (!readIds.contains(id)) {
                        String commenterName = userRepository.findById(commenterId)
                                .map(User::getName)
                                .orElse("Someone");
                        result.add(Map.of(
                                "id", id,
                                "type", "comment",
                                "message", commenterName + " commented on your post",
                                "read", false
                        ));
                    }
                }
            }
        }

        return result;
    }

    @PostMapping("/mark-read")
    public void markNotificationAsRead(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String notificationId = body.get("notificationId");

        if (!historyRepo.existsByUserIdAndNotificationId(userId, notificationId)) {
            NotificationHistory history = new NotificationHistory();
            history.setUserId(userId);
            history.setNotificationId(notificationId);
            historyRepo.save(history);
        }
    }
}
