package com.learnloop.backend.controller;

import com.learnloop.backend.dto.PostWithUserDTO;
import com.learnloop.backend.dto.UpdateCommentRequest;
import com.learnloop.backend.dto.CommentDTO;
import com.learnloop.backend.dto.CommentRequest;
import com.learnloop.backend.model.Post;
import com.learnloop.backend.model.Post.Comment;
import com.learnloop.backend.model.User;
import com.learnloop.backend.repository.PostRepository;
import com.learnloop.backend.repository.UserRepository;
import com.learnloop.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private PostWithUserDTO convertToDTO(Post post) {
        User user = userRepository.findById(post.getUserId()).orElse(null);
        String userName = user != null ? user.getName() : "Unknown";
        String profilePicturePath = user != null ? user.getProfilePicturePath() : null;
        List<CommentDTO> commentDTOs = post.getComments().stream().map(comment -> {
            User commentUser = userRepository.findById(comment.getUserId()).orElse(null);
            String commentUserName = commentUser != null ? commentUser.getName() : "Unknown";
            return new CommentDTO(
                comment.getId(),
                comment.getUserId(), // Include userId as per Mongo structure
                commentUserName,
                comment.getContent(),
                comment.getCreatedAt()
            );
        }).collect(Collectors.toList());
        return new PostWithUserDTO(
            post.getId(),
            post.getUserId(),
            userName,
            post.getDescription(),
            post.getMediaUrls(),
            post.getCreatedAt(),
            post.getLikes(),
            commentDTOs,
            profilePicturePath
        );
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("description") String description,
            @RequestParam(value = "media", required = false) MultipartFile[] media,
            @RequestParam("userId") String userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body("User not found.");
            }

            Post post = new Post();
            post.setUserId(userId);
            post.setDescription(description);
            post.setCreatedAt(LocalDateTime.now());

            if (media != null && media.length > 0) {
                List<String> mediaUrls = fileStorageService.storeFiles(media);
                post.setMediaUrls(mediaUrls);
            }

            Post savedPost = postRepository.save(post);

            List<String> userPosts = user.getPosts();
            userPosts.add(savedPost.getId());
            user.setPosts(userPosts);
            userRepository.save(user);

            return ResponseEntity.ok(convertToDTO(savedPost));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating post: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(@PathVariable String userId) {
        List<Post> posts = postRepository.findByUserId(userId);
        List<PostWithUserDTO> postDTOs = posts.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(postDTOs);
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getFeed(@RequestParam String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found.");
        }
        List<String> followingIds = user.getFollowing() != null ? user.getFollowing() : new ArrayList<>();
        List<String> userIds = new ArrayList<>(followingIds);
        userIds.add(userId);
        List<Post> posts = postRepository.findByUserIdIn(userIds);
        List<PostWithUserDTO> postDTOs = posts.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(postDTOs);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable String postId, @RequestParam String userId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) {
            return ResponseEntity.status(404).body("Post not found.");
        }
        List<String> likes = post.getLikes();
        if (likes == null) {
            likes = new ArrayList<>();
        }
        if (!likes.contains(userId)) {
            likes.add(userId);
            post.setLikes(likes);
            postRepository.save(post);
        }
        return ResponseEntity.ok(convertToDTO(post));
    }

    // @PostMapping("/{postId}/comment")
    // public ResponseEntity<?> addComment(
    //         @PathVariable String postId,
    //         @RequestParam String userId,
    //         @RequestParam String content) {
    //     Post post = postRepository.findById(postId).orElse(null);
    //     if (post == null) {
    //         return ResponseEntity.status(404).body("Post not found.");
    //     }
    //     Comment comment = new Comment();
    //     comment.setId(UUID.randomUUID().toString());
    //     comment.setUserId(userId);
    //     comment.setContent(content);
    //     comment.setCreatedAt(LocalDateTime.now());
    //     List<Comment> comments = post.getComments();
    //     comments.add(comment);
    //     post.setComments(comments);
    //     postRepository.save(post);
    //     return ResponseEntity.ok(convertToDTO(post));
    // }

    // Update the addComment method in PostController.java
// @PostMapping("/{postId}/comment")
// public ResponseEntity<?> addComment(
//         @PathVariable String postId,
//         @RequestBody CommentRequest request) {  // Changed to use RequestBody
    
//     Post post = postRepository.findById(postId).orElse(null);
//     if (post == null) {
//         return ResponseEntity.status(404).body("Post not found.");
//     }
    
//     Comment comment = new Comment();
//     comment.setId(UUID.randomUUID().toString());
//     comment.setUserId(request.getUserId());  // Get from request DTO
//     comment.setContent(request.getContent()); // Get from request DTO
//     comment.setCreatedAt(LocalDateTime.now());
    
//     List<Comment> comments = post.getComments();
//     comments.add(comment);
//     post.setComments(comments);
//     postRepository.save(post);
    
//     return ResponseEntity.ok(convertToDTO(post));
// }

// Add these new methods to PostController.java
@PostMapping("/{postId}/comment")
public ResponseEntity<?> addComment(
        @PathVariable String postId,
        @RequestBody CommentRequest request) {  // Make sure this is @RequestBody
    
    Post post = postRepository.findById(postId).orElse(null);
    if (post == null) {
        return ResponseEntity.status(404).body("Post not found.");
    }
    
    // Add debug logging
    System.out.println("Received comment request: " + request.getUserId() + " - " + request.getContent());
    
    Comment comment = new Comment();
    comment.setId(UUID.randomUUID().toString());
    comment.setUserId(request.getUserId());
    comment.setContent(request.getContent());
    comment.setCreatedAt(LocalDateTime.now());
    
    // Initialize comments list if null
    if (post.getComments() == null) {
        post.setComments(new ArrayList<>());
    }
    
    post.getComments().add(comment);
    postRepository.save(post);
    
    return ResponseEntity.ok(convertToDTO(post));
}

@PutMapping("/{postId}/comment/{commentId}")
public ResponseEntity<?> updateComment(
        @PathVariable String postId,
        @PathVariable String commentId,
        @RequestBody UpdateCommentRequest request) {
    
    Post post = postRepository.findById(postId).orElse(null);
    if (post == null) {
        return ResponseEntity.status(404).body("Post not found.");
    }
    
    // Find the comment
    Comment commentToUpdate = post.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElse(null);
    
    if (commentToUpdate == null) {
        return ResponseEntity.status(404).body("Comment not found.");
    }
    
    // Check if the requesting user is the comment owner
    if (!commentToUpdate.getUserId().equals(request.getUserId())) {
        return ResponseEntity.status(403).body("Unauthorized to update this comment.");
    }
    
    // Update the comment
    commentToUpdate.setContent(request.getContent());
    postRepository.save(post);
    
    return ResponseEntity.ok(convertToDTO(post));
}

@DeleteMapping("/{postId}/comment/{commentId}")
public ResponseEntity<?> deleteComment(
        @PathVariable String postId,
        @PathVariable String commentId,
        @RequestParam String userId) {
    
    Post post = postRepository.findById(postId).orElse(null);
    if (post == null) {
        return ResponseEntity.status(404).body("Post not found.");
    }
    
    // Find the comment
    Comment commentToDelete = post.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElse(null);
    
    if (commentToDelete == null) {
        return ResponseEntity.status(404).body("Comment not found.");
    }
    
    // Check if the requesting user is the comment owner
    if (!commentToDelete.getUserId().equals(userId)) {
        return ResponseEntity.status(403).body("Unauthorized to delete this comment.");
    }
    
    // Remove the comment
    post.getComments().remove(commentToDelete);
    postRepository.save(post);
    
    return ResponseEntity.ok(convertToDTO(post));
}

    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestParam String userId,
            @RequestParam String description,
            @RequestParam(value = "media", required = false) MultipartFile[] media) {
        try {
            Post post = postRepository.findById(postId).orElse(null);
            if (post == null || !post.getUserId().equals(userId)) {
                return ResponseEntity.status(403).body("Unauthorized or post not found.");
            }

            if (media != null && media.length > 0) {
                List<String> oldMediaUrls = post.getMediaUrls();
                if (oldMediaUrls != null && !oldMediaUrls.isEmpty()) {
                    for (String mediaUrl : oldMediaUrls) {
                        try {
                            fileStorageService.deleteFile(mediaUrl);
                        } catch (IOException e) {
                            System.err.println("Failed to delete old media file: " + e.getMessage());
                        }
                    }
                }
                List<String> mediaUrls = fileStorageService.storeFiles(media);
                post.setMediaUrls(mediaUrls);
            }

            post.setDescription(description);
            postRepository.save(post);
            return ResponseEntity.ok(convertToDTO(post));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating post: " + e.getMessage());
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId, @RequestParam String userId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null || !post.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body("Unauthorized or post not found.");
        }

        List<String> mediaUrls = post.getMediaUrls();
        if (mediaUrls != null && !mediaUrls.isEmpty()) {
            for (String mediaUrl : mediaUrls) {
                try {
                    fileStorageService.deleteFile(mediaUrl);
                } catch (IOException e) {
                    System.err.println("Failed to delete media file: " + e.getMessage());
                }
            }
        }

        postRepository.delete(post);

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            List<String> userPosts = user.getPosts();
            userPosts.remove(postId);
            user.setPosts(userPosts);
            userRepository.save(user);
        }

        return ResponseEntity.ok("Post deleted.");
    }
}
