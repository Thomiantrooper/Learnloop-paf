package com.learnloop.backend.repository;

import com.learnloop.backend.model.UserFavorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserFavoriteRepository extends MongoRepository<UserFavorite, String> {
    List<UserFavorite> findByUserId(String userId);
    UserFavorite findByUserIdAndPlanId(String userId, String planId);
    void deleteByUserIdAndPlanId(String userId, String planId);
}