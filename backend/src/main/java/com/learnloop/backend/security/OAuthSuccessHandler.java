package com.learnloop.backend.security;

import com.learnloop.backend.model.User;
import com.learnloop.backend.repository.UserRepository;
import com.learnloop.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;

        if (optionalUser.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setUsername(email.split("@")[0]); // generate from email
            user.setPassword(""); // blank for OAuth users
            user = userRepository.save(user);
        } else {
            user = optionalUser.get();
        }

        String token = jwtUtil.generateToken(user.getEmail());

        response.sendRedirect("http://localhost:3000/oauth-success?token=" + token + "&userId=" + user.getId());
    }
}
