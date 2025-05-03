package com.learnloop.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String getAIInsight(String promptText) {
        try {
            String urlStr = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
            URL url = new URL(urlStr);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            connection.setDoOutput(true);
    
            // FIXED JSON structure
            String jsonPayload = String.format("""
            {
              "contents": [
                {
                  "role": "user",
                  "parts": [
                    { "text": "%s" }
                  ]
                }
              ]
            }
            """, promptText.replace("\"", "\\\"")); // escape double quotes
    
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonPayload.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
    
            // Read response
            BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream(), "utf-8"));
            StringBuilder responseBuilder = new StringBuilder();
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                responseBuilder.append(responseLine.trim());
            }
    
            // Parse Gemini JSON output
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBuilder.toString());
            return root.path("candidates").get(0)
                       .path("content")
                       .path("parts").get(0)
                       .path("text").asText("⚠️ Gemini returned no text.");
    
        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Error calling Gemini API: " + e.getMessage();
        }
    }
    

    private String extractInsightFromGeminiResponse(String jsonResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonResponse);
            JsonNode textNode = root.path("candidates").get(0)
                                     .path("content")
                                     .path("parts").get(0)
                                     .path("text");

            if (!textNode.isMissingNode()) {
                return textNode.asText();
            } else {
                return "⚠️ Gemini returned an empty response.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "❌ Failed to parse Gemini response.";
        }
    }
}
