// src/main/java/com/learnloop/backend/controller/FileController.java
package com.learnloop.backend.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            // Log the incoming filename for debugging
            System.out.println("Requested filename: " + filename);

            // The filename might already include "/uploads/" (e.g., "/uploads/12345_profile.jpg")
            // We only need the part after "/uploads/" if it exists
            String cleanFilename = filename.startsWith("uploads/") ? filename.substring("uploads/".length()) : filename;
            Path filePath = Paths.get("uploads").resolve(cleanFilename);

            // Log the resolved file path for debugging
            System.out.println("Resolved file path: " + filePath.toString());

            if (!Files.exists(filePath)) {
                System.out.println("File not found: " + filePath.toString());
                return ResponseEntity.status(404).body(null);
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            ByteArrayResource resource = new ByteArrayResource(fileBytes);

            // Determine the content type
            String contentType = cleanFilename.endsWith(".mp4") ? "video/mp4" :
                                cleanFilename.endsWith(".png") ? "image/png" : "image/jpeg";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            System.err.println("Error serving file: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }
}