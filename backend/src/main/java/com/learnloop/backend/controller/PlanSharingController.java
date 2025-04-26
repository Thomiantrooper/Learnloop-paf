package com.learnloop.backend.controller;

import com.learnloop.backend.model.PlanSharing;
import com.learnloop.backend.service.PlanSharingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plan-sharing")
public class PlanSharingController {
    @Autowired
    private PlanSharingService planSharingService;

    @PostMapping
    public ResponseEntity<PlanSharing> createUpdate(@RequestBody PlanSharing planSharing) {
        return ResponseEntity.ok(planSharingService.createUpdate(planSharing));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlanSharing>> getUpdatesByUser(@PathVariable String userId) {
        return ResponseEntity.ok(planSharingService.getUpdatesByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUpdate(@PathVariable String id) {
        planSharingService.deleteUpdate(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanSharing> updateUpdate(@PathVariable String id, @RequestBody PlanSharing planSharing) {
        planSharing.setId(id);
        return ResponseEntity.ok(planSharingService.createUpdate(planSharing));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<PlanSharing> updateFavoriteStatus(
        @PathVariable String id, 
        @RequestParam int isFavorite
    ) {
        return ResponseEntity.ok(planSharingService.updateFavoriteStatus(id, isFavorite));
    }

    
}