package com.civictrack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Cross-Origin Resource Sharing (CORS) Configuration.
 *
 * Configures application-wide CORS at the Servlet Filter level to ensure that:
 * 1. Preflight (OPTIONS) requests are intercepted and approved before hitting Spring MVC interceptors.
 * 2. Frontend clients (React / Vite on port 5173, preview on 4173, Next.js on 3000, etc.) can access the API.
 * 3. Standard HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD) are allowed.
 * 4. Custom headers such as Authorization tokens and Content-Type are accepted.
 * 5. Critical response headers (Authorization, Content-Disposition) are exposed to frontend scripts.
 * 6. Error dispatches (such as 401 Unauthorized or 403 Forbidden) retain CORS headers.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow sending credentials (cookies, HTTP authorization headers)
        config.setAllowCredentials(true);

        // Allowed frontend origins & patterns
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:4173",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
                "http://localhost:*",
                "http://127.0.0.1:*",
                "*"
        ));

        // Allowed HTTP methods
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
        ));

        // Allowed HTTP request headers
        config.setAllowedHeaders(Arrays.asList(
                "Origin",
                "Content-Type",
                "Accept",
                "Authorization",
                "X-Requested-With",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // Exposed headers that the browser client is permitted to read
        config.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Disposition"
        ));

        // Cache preflight OPTIONS response for 1 hour (3600 seconds)
        config.setMaxAge(3600L);

        // Apply this CORS configuration to all endpoints
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
