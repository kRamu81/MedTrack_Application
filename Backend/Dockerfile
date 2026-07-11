# ==================================================
# Stage 1: Build Stage
# ==================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy the Maven project descriptor
COPY Backend/pom.xml .

# Download dependencies in offline mode to leverage Docker layer caching
RUN mvn dependency:go-offline -B

# Copy the application source code
COPY Backend/src ./src

# Package the application (build fat jar), skipping tests for build speed
RUN mvn package -DskipTests -B

# ==================================================
# Stage 2: Runtime Stage
# ==================================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Expose the default server port
EXPOSE 8081

# Copy the packaged jar from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Run the packaged Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
