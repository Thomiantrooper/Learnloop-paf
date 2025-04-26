package com.learnloop.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;

    public GeminiService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String getAIInsight(String prompt) {
        try {
            if (prompt == null || prompt.trim().isEmpty() || prompt.matches("^[a-fA-F0-9]{24}$")) {
                return "⚠️ Cannot generate AI insight for empty input or ID only.";
            }

            String fullPrompt = """
                I am a student who recently completed or learned the following:
                
                %s
                
                Please give me a motivational and career-focused summary in 5 bullet points.
                """.formatted(prompt);

            String body = """
            {
              "contents": [{
                "parts": [{
                  "text": "%s"
                }]
              }]
            }
            """.formatted(fullPrompt.replace("\"", "\\\""));

            String apiResponse = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/gemini-1.5-flash:generateContent")
                            .queryParam("key", geminiApiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String markdownInsight = extractInsightFromGeminiResponse(apiResponse);
            String htmlInsight = convertMarkdownToHtml(markdownInsight);

            return htmlInsight; // <--- return cleaned HTML version

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

    private String convertMarkdownToHtml(String markdown) {
        Parser parser = Parser.builder().build();
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        return renderer.render(parser.parse(markdown));
    }
}
