package com.learnloop.backend.repository;

import com.learnloop.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserId(String userId);
    List<Post> findByUserIdIn(List<String> userIds);
}