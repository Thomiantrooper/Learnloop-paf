// src/main/java/com/learnloop/backend/config/SupabaseConfig.java
package com.learnloop.backend.config;

import okhttp3.OkHttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SupabaseConfig {

    public static final String SUPABASE_URL = "https://wdyxdfweunrrxhrjzmpn.supabase.co";
    public static final String SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeXhkZndldW5ycnhocmp6bXBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjk3MDAyOSwiZXhwIjoyMDU4NTQ2MDI5fQ.Gu7LSS-rQruR83eX3PyNTO-4FQFnoAcJuNXHhiiuoSs";
    public static final String BUCKET_NAME = "learnloop";

    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient();
    }
}