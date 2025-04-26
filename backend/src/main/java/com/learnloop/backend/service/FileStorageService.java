// src/main/java/com/learnloop/backend/service/FileStorageService.java
package com.learnloop.backend.service;

import com.learnloop.backend.config.SupabaseConfig;
import okhttp3.*;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private OkHttpClient okHttpClient;

    private final String supabaseUrl = SupabaseConfig.SUPABASE_URL;
    private final String supabaseKey = SupabaseConfig.SUPABASE_SERVICE_KEY;
    private final String bucketName = SupabaseConfig.BUCKET_NAME;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/png", "image/jpeg", "image/jpg");
    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList("video/mp4", "video/quicktime");
    private static final long MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    public List<String> storeFiles(MultipartFile[] files) throws Exception {
        if (files.length > 3) {
            throw new IllegalArgumentException("Maximum 3 files allowed.");
        }

        List<String> mediaUrls = new ArrayList<>();
        Tika tika = new Tika();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                // Validate file type
                String contentType = file.getContentType();
                if (!ALLOWED_IMAGE_TYPES.contains(contentType) && !ALLOWED_VIDEO_TYPES.contains(contentType)) {
                    throw new IllegalArgumentException(
                        "Invalid file type. Allowed image types: PNG, JPG, JPEG. Allowed video types: MP4, MOV."
                    );
                }

                // Validate video size (if it's a video)
                if (ALLOWED_VIDEO_TYPES.contains(contentType)) {
                    if (file.getSize() > MAX_VIDEO_SIZE) {
                        throw new IllegalArgumentException("Video file size must be less than 10MB.");
                    }

                    // Validate video duration
                    try (InputStream inputStream = file.getInputStream()) {
                        Metadata metadata = new Metadata();
                        tika.parse(inputStream, metadata);
                        String durationStr = metadata.get("duration");
                        if (durationStr != null) {
                            double duration = Double.parseDouble(durationStr);
                            if (duration > 30) {
                                throw new IllegalArgumentException("Video must be 30 seconds or less.");
                            }
                        }
                    }
                }

                // Generate a unique filename
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

                // Upload file to Supabase
                byte[] fileBytes = file.getBytes();
                uploadFileToSupabase(fileName, fileBytes);

                // Generate the public URL
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
                mediaUrls.add(publicUrl);
            }
        }
        return mediaUrls;
    }

    private void uploadFileToSupabase(String fileName, byte[] fileBytes) throws IOException {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        RequestBody body = RequestBody.create(fileBytes, MediaType.parse("application/octet-stream"));
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Authorization", "Bearer " + supabaseKey)
                .addHeader("Content-Type", "application/octet-stream")
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to upload file to Supabase: " + response.message());
            }
        }
    }

    // New method to delete a file from Supabase Storage
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return; // Nothing to delete
        }

        // Extract the file name from the public URL
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + fileName;

        Request request = new Request.Builder()
                .url(url)
                .delete()
                .addHeader("Authorization", "Bearer " + supabaseKey)
                .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to delete file from Supabase: " + response.message());
            }
        }
    }

    public String getFileUrl(String fileName) {
        return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + fileName;
    }
}