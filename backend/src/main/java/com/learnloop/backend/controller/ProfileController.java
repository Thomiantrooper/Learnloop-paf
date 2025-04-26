// src/main/java/com/learnloop/backend/controller/ProfileController.java
package com.learnloop.backend.controller;

import com.learnloop.backend.model.User;
import com.learnloop.backend.repository.UserRepository;
import com.learnloop.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private User findUserById(String userId) {
        return userRepository.findById(userId).orElse(null);
    }

    @GetMapping("/public/{userId}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String userId) {
        User user = findUserById(userId);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<?> followUser(@PathVariable String userId, @RequestParam String followerId) {
        if (userId.equals(followerId)) {
            return ResponseEntity.badRequest().body("You cannot follow yourself.");
        }
        User user = findUserById(userId);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        User follower = findUserById(followerId);
        if (follower == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        if (user.getFollowers() == null) {
            user.setFollowers(new ArrayList<>());
        }
        if (!user.getFollowers().contains(followerId)) {
            user.getFollowers().add(followerId);
        }
        if (follower.getFollowing() == null) {
            follower.setFollowing(new ArrayList<>());
        }
        if (!follower.getFollowing().contains(userId)) {
            follower.getFollowing().add(userId);
        }
        userRepository.save(user);
        userRepository.save(follower);
        return ResponseEntity.ok("Followed successfully.");
    }

    @PostMapping("/{userId}/unfollow")
public ResponseEntity<?> unfollowUser(@PathVariable String userId, @RequestParam String followerId) {
    if (userId.equals(followerId)) {
        return ResponseEntity.badRequest().body("You cannot unfollow yourself.");
    }
    User user = findUserById(userId);
    if (user == null) {
        return ResponseEntity.status(404).body("User not found.");
    }
    User follower = findUserById(followerId);
    if (follower == null) {
        return ResponseEntity.status(404).body("User not found.");
    }
    if (user.getFollowers() != null) {
        user.getFollowers().remove(followerId);
    }
    if (follower.getFollowing() != null) {
        follower.getFollowing().remove(userId);
    }
    userRepository.save(user);
    userRepository.save(follower);
    return ResponseEntity.ok("Unfollowed successfully.");
}

    @GetMapping("/followers")
    public ResponseEntity<?> getFollowers(@RequestParam List<String> ids) {
        List<User> followers = userRepository.findByIdIn(ids);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/following")
    public ResponseEntity<?> getFollowing(@RequestParam("ids") List<String> ids) {
        List<User> following = userRepository.findByIdIn(ids);
        return ResponseEntity.ok(following);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<?> getSuggestions(@RequestParam String currentUserId) {
        User currentUser = findUserById(currentUserId);
        if (currentUser == null) {
            return ResponseEntity.status(404).body("Current user not found.");
        }
        List<User> allUsers = userRepository.findAll();
        List<User> suggestions = new ArrayList<>();
        List<String> followingIds = currentUser.getFollowing();
        if (followingIds == null) {
            followingIds = new ArrayList<>();
        }
        for (User user : allUsers) {
            if (!user.getId().equals(currentUserId) && !followingIds.contains(user.getId())) {
                suggestions.add(user);
            }
        }
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/{userId}/upload-profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            User user = findUserById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found.");
            }

            // Validate file type (only images allowed for profile pictures)
            String contentType = file.getContentType();
            if (!Arrays.asList("image/png", "image/jpeg", "image/jpg").contains(contentType)) {
                return ResponseEntity.badRequest().body("Invalid file type for profile picture. Only PNG, JPG, and JPEG are allowed.");
            }

            // Validate file size (2MB limit)
            if (file.getSize() > 2 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size exceeds 2MB limit.");
            }

            // Delete the old profile picture from Supabase if it exists
            String oldProfilePicturePath = user.getProfilePicturePath();
            if (oldProfilePicturePath != null && !oldProfilePicturePath.isEmpty()) {
                try {
                    fileStorageService.deleteFile(oldProfilePicturePath);
                } catch (IOException e) {
                    // Log the error but proceed with the upload
                    System.err.println("Failed to delete old profile picture: " + e.getMessage());
                }
            }

            // Upload the new profile picture
            List<String> fileUrls = fileStorageService.storeFiles(new MultipartFile[]{file});
            if (fileUrls.isEmpty()) {
                return ResponseEntity.status(500).body("Failed to store profile picture.");
            }
            user.setProfilePicturePath(fileUrls.get(0));
            userRepository.save(user);

            // Notify followers via WebSocket
            if (user.getFollowers() != null) {
                for (String followerId : user.getFollowers()) {
                    messagingTemplate.convertAndSend(
                        "/topic/profile-update/" + followerId,
                        new ProfileUpdateMessage(userId, fileUrls.get(0))
                    );
                }
            }

            return ResponseEntity.ok("Profile picture uploaded successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload profile picture: " + e.getMessage());
        }
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<?> updateProfile(
            @PathVariable String userId,
            @RequestParam String name,
            @RequestParam(required = false) String bio) {
        User user = findUserById(userId);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        user.setName(name);
        user.setBio(bio != null ? bio : user.getBio());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{userId}/bio")
    public ResponseEntity<?> deleteBio(@PathVariable String userId) {
        User user = findUserById(userId);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        user.setBio(null);
        userRepository.save(user);
        return ResponseEntity.ok("Bio deleted successfully.");
    }

    @PostMapping("/{userId}/remove-follower")
public ResponseEntity<?> removeFollower(
    @PathVariable String userId,
    @RequestParam String followerId
) {
    User user = findUserById(userId);
    User follower = findUserById(followerId);
    
    if (user == null || follower == null) {
        return ResponseEntity.status(404).body("User not found");
    }
    
    // Remove from user's followers list
    if (user.getFollowers() != null) {
        user.getFollowers().remove(followerId);
    }
    
    // Remove from follower's following list
    if (follower.getFollowing() != null) {
        follower.getFollowing().remove(userId);
    }
    
    userRepository.save(user);
    userRepository.save(follower);
    
    return ResponseEntity.ok("Follower removed successfully");
}
}

class ProfileUpdateMessage {
    private String userId;
    private String profilePicturePath;

    public ProfileUpdateMessage(String userId, String profilePicturePath) {
        this.userId = userId;
        this.profilePicturePath = profilePicturePath;
    }

    public String getUserId() {
        return userId;
    }

    public String getProfilePicturePath() {
        return profilePicturePath;
    }
}