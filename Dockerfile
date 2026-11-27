# Multi-stage Dockerfile for CivicTrack Spring Boot Backend

# ==========================================
# Stage 1: Build the Application
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom.xml first to take advantage of Docker layer caching for dependencies
COPY pom.xml .

# Download dependencies offline
RUN mvn dependency:go-offline -B

# Copy project source code
COPY src ./src

# Build the executable fat JAR, skipping tests for fast image builds
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Minimal Runtime Environment
# ==========================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for health checks (optional) and tzdata for timezone accuracy
RUN apk add --no-cache curl tzdata

# Create a non-privileged user and group for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create directory for file uploads and grant ownership to spring user
RUN mkdir -p /app/uploads && chown -R spring:spring /app

# Copy the compiled jar from the build stage
COPY --from=builder /app/target/civictrack-api-*.jar /app/app.jar

# Ensure proper permissions
RUN chown spring:spring /app/app.jar

# Run as non-root user
USER spring:spring

# Expose backend service port
EXPOSE 8080

# Note: persistent uploads are provided by a Railway Volume mounted at /app/uploads (configured in Railway, not in the Dockerfile)

# JVM container-aware memory and performance tuning
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck to verify the backend is responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8080/api/reports?district=Chennai || exit 1

# Launch the Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
