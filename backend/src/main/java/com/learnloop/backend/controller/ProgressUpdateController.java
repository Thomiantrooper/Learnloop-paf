package com.learnloop.backend.controller;

import com.learnloop.backend.model.ProgressUpdate;
import com.learnloop.backend.service.GeminiService;
import com.learnloop.backend.service.ProgressUpdateService;
import com.learnloop.backend.repository.ProgressUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress-updates")
public class ProgressUpdateController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ProgressUpdateService progressUpdateService;

    @PostMapping
    public ResponseEntity<ProgressUpdate> createUpdate(@RequestBody ProgressUpdate progressUpdate) {
        return ResponseEntity.ok(progressUpdateService.createUpdate(progressUpdate));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProgressUpdate>> getUpdatesByUser(@PathVariable String userId) {
        return ResponseEntity.ok(progressUpdateService.getUpdatesByUser(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUpdate(@PathVariable String id) {
        progressUpdateService.deleteUpdate(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgressUpdate> updateUpdate(@PathVariable String id, @RequestBody ProgressUpdate progressUpdate) {
        progressUpdate.setId(id);
        return ResponseEntity.ok(progressUpdateService.createUpdate(progressUpdate));
    }

    @PutMapping("/{id}/insight")
    public ResponseEntity<ProgressUpdate> addInsight(@PathVariable String id, @RequestBody Map<String, String> body) {
        ProgressUpdate update = progressUpdateService.getById(id);
        update.setAiInsight(body.get("aiInsight"));
        update.setUserReflection(body.get("userReflection"));
        return ResponseEntity.ok(progressUpdateService.createUpdate(update));
    }
    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @PostMapping("/{id}/insight")
    public String generateInsight(@PathVariable String id) {
        ProgressUpdate update = progressUpdateRepository.findById(id).orElseThrow(() -> new RuntimeException("Progress not found"));

        String prompt = "Summarize this learning activity:\n\n" +
                        "Title: " + update.getTitle() + "\n" +
                        "Description: " + update.getDescription() + "\n\n" +
                        "Provide a 2-3 line motivational insight.";

        return geminiService.getAIInsight(prompt);
    }
        

    
    @PostMapping("/{id}/email")
    public ResponseEntity<?> sendSkillInsightEmail(@PathVariable String id, @RequestBody Map<String, String> body) {
        String to = body.get("to");
        String subject = body.get("subject");
        String message = body.get("message");
        progressUpdateService.sendSkillInsightEmail(id, to, subject, message);
        return ResponseEntity.ok("Email sent successfully!");
    }
}
