package com.civictrack.security;

import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    public record AdminSession(String token, String username, String displayName, String role, String department, LocalDateTime expiresAt) {}
    public record AuthResponse(String token, String username, String displayName, String role, String department, String tokenType) {}

    private final Map<String, AdminSession> activeSessions = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    // Default admin credentials configured for Tamil Nadu Civic Operations Desk
    private static final String DEFAULT_ADMIN_USER = "admin";
    private static final String DEFAULT_ADMIN_EMAIL = "admin@tncivic.gov.in";
    // Fixed salt for demo environment hashing
    private static final String SALT = "TNGovCivicTrack2026Salt";
    private final String adminPasswordHash;

    public AuthService() {
        this.adminPasswordHash = hashPassword("AdminTN@2026", SALT);
    }

    public AuthResponse login(String usernameOrEmail, String password) {
        if (usernameOrEmail == null || password == null) {
            throw new IllegalArgumentException("Username and password are required");
        }
        String cleanUser = usernameOrEmail.trim().toLowerCase();
        boolean matchesUser = cleanUser.equals(DEFAULT_ADMIN_USER) || cleanUser.equals(DEFAULT_ADMIN_EMAIL);
        String inputHash = hashPassword(password.trim(), SALT);

        if (!matchesUser || !adminPasswordHash.equals(inputHash)) {
            throw new IllegalArgumentException("Invalid credentials. Please provide valid Tamil Nadu civic administrative credentials.");
        }

        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);

        AdminSession session = new AdminSession(
            token,
            cleanUser,
            "Tamil Nadu Municipal Admin",
            "ROLE_ADMIN",
            "Greater Chennai Corporation & Municipal Administration",
            LocalDateTime.now().plusHours(24)
        );

        activeSessions.put(token, session);
        return new AuthResponse(token, session.username(), session.displayName(), session.role(), session.department(), "Bearer");
    }

    public boolean isValidToken(String token) {
        if (token == null || token.isBlank()) return false;
        AdminSession session = activeSessions.get(token);
        if (session == null) return false;
        if (session.expiresAt().isBefore(LocalDateTime.now())) {
            activeSessions.remove(token);
            return false;
        }
        return true;
    }

    public AdminSession getSession(String token) {
        if (isValidToken(token)) {
            return activeSessions.get(token);
        }
        return null;
    }

    public void logout(String token) {
        if (token != null) {
            activeSessions.remove(token);
        }
    }

    private String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hashed = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new RuntimeException("Error calculating hash", e);
        }
    }
}
