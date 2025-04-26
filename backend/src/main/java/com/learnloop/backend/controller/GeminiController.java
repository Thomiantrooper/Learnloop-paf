package com.learnloop.backend.controller;

import com.learnloop.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/insight")
    public String generateInsight(@RequestBody String prompt) {
        return geminiService.getAIInsight(prompt);
    }

    @PostMapping("/api/gemini/insight")
public String generateInsight(@RequestBody Map<String, String> body) {
    String prompt = body.get("prompt");
    return geminiService.getAIInsight(prompt);
}

@GetMapping("/insight")
public ResponseEntity<String> getInsight(@RequestParam String content) {
    String insight = geminiService.getAIInsight(content);
    return ResponseEntity.ok(insight);
}


}
