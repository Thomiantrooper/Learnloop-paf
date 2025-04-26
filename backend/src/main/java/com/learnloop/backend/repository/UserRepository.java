package com.learnloop.backend.repository;

import com.learnloop.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);  // Find by username
    Optional<User> findByEmail(String email);       // Find by email
    List<User> findByIdIn(List<String> ids);  // Fetch multiple users by IDs
}