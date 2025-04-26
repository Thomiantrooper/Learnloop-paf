package com.learnloop.backend.service;

import com.learnloop.backend.model.PlanSharing;
import com.learnloop.backend.repository.PlanSharingRepository;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;

@Service
public class PlanSharingService {
    @Autowired
    private PlanSharingRepository planSharingRepository;
    
    private static final Logger logger = LoggerFactory.getLogger(PlanSharingService.class);

   public PlanSharing createUpdate(PlanSharing planSharing) {
        if (planSharing.getTopics() == null) {
            planSharing.setTopics(new ArrayList<>());
        }
        if (planSharing.getResources() == null) {
            planSharing.setResources(new ArrayList<>());
        }
        planSharing.setDate(LocalDateTime.now());
        return planSharingRepository.save(planSharing);
    }

    public List<PlanSharing> getUpdatesByUser(String userId) {
        return planSharingRepository.findByUserId(userId);
    }

    public void deleteUpdate(String id) {
        planSharingRepository.deleteById(id);
    }

    

    public PlanSharing toggleFavorite(String id) {
        PlanSharing planSharing = planSharingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        logger.info("Toggling favorite status for plan: {}", planSharing.getId());
        logger.info("Current favorite status: {}", planSharing.isFavorite());
        planSharing.setFavorite(!planSharing.isFavorite());
        logger.info("New favorite status: {}", planSharing.isFavorite());
        return planSharingRepository.save(planSharing);
    }

    public PlanSharing updateFavoriteStatus(String id, int isFavorite) {
        PlanSharing planSharing = planSharingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        planSharing.setFavorite(isFavorite == 1);
        PlanSharing updatedPlan = planSharingRepository.save(planSharing);
        logger.info("Updated favorite status for plan {}: {}", id, updatedPlan.isFavorite());
        
        return updatedPlan;
    }

    

    
}