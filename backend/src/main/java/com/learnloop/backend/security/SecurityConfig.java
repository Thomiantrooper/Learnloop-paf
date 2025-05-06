package com.learnloop.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private OAuthSuccessHandler oAuthSuccessHandler; 

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .authorizeRequests(authorize -> authorize
                .requestMatchers(
                    "/", 
                    "/login**", 
                    "/error", 
                    "/oauth2/**", 
                    "/api/oauth/**",
                    "/api/auth/**", 
                    "/api/profile/**", 
                    "/api/profile/*/upload-profile-picture",
                    "/api/profile/*/update", 
                    "/api/profile/*/bio", 
                    "/api/profile/suggestions",
                    "/api/profile/following", 
                    "/api/profile/public/**", 
                    "/api/my-plans/**",
                    "/api/posts/**", 
                    "/api/files/**", 
                    "/api/progress-updates/**",
                    "/api/plan-sharing/**",
                    "/api/gemini/insight",
                    "/api/user-notifications/**", 
                    "/api/notification-history/**",
                    "/api/gemini/insight",
                    "/api/gemini",
                     "/ws/**"
                ).permitAll()
                .requestMatchers(HttpMethod.POST, "/api/posts/*/comment").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .successHandler(oAuthSuccessHandler) 
                .failureUrl("http://localhost:3000/error?message=OAuth2 Login Failed")
            )
            .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:3000")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID","token", "userId")
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
