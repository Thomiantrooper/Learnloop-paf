package com.learnloop.backend.controller;

import com.learnloop.backend.model.User;
import com.learnloop.backend.service.UserService;
import com.learnloop.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());  // Return user-friendly error message
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        // Trim inputs to avoid whitespace issues
        user.setUsername(user.getUsername().trim());
        user.setPassword(user.getPassword().trim());

        // Find the user by username
        User existingUser = userService.findByUsername(user.getUsername());
        if (existingUser != null) {
            // Verify the password
            if (passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
                // Generate a JWT token
                String token = jwtUtil.generateToken(existingUser.getEmail());

                // Return the token and userId in the response
                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                response.put("userId", existingUser.getId()); // Include the userId
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
        } else {
            return ResponseEntity.status(401).body("User not found");
        }
    }
}