package com.civictrack.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Protect admin operations: status updates, creating announcements, deletions
        boolean requiresAdmin = false;
        if (path.startsWith("/api/reports/") && path.endsWith("/status") && "PATCH".equalsIgnoreCase(method)) {
            requiresAdmin = true;
        } else if (path.equals("/api/announcements") && "POST".equalsIgnoreCase(method)) {
            requiresAdmin = true;
        } else if (path.startsWith("/api/reports/") && "DELETE".equalsIgnoreCase(method)) {
            requiresAdmin = true;
        }

        if (!requiresAdmin) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (authService.isValidToken(token)) {
                return true;
            }
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"Security verification failed: Valid administrator session required to perform this action.\"}");
        return false;
    }
}
