package com.learnloop.backend.repository;

import com.learnloop.backend.model.PlanSharing;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PlanSharingRepository extends MongoRepository<PlanSharing, String> {
    List<PlanSharing> findByUserId(String userId);
}