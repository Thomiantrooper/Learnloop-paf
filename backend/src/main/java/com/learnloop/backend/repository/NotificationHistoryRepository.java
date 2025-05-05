package com.learnloop.backend.repository;

import com.learnloop.backend.model.NotificationHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationHistoryRepository extends MongoRepository<NotificationHistory, String> {
    List<NotificationHistory> findByUserId(String userId);
    boolean existsByUserIdAndNotificationId(String userId, String notificationId);
}
