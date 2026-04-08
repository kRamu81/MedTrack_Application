# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
# Copy only package files first for better caching
COPY package*.json ./
RUN npm install
# Copy the rest of the frontend code
COPY . ./
# Build the frontend - results in /app/build
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.8.4-openjdk-17-slim AS backend-builder
WORKDIR /app
# Copy the built frontend to spring-boot static resources
# This allows the backend to serve the frontend on the same port
COPY --from=frontend-builder /app/build /app/Backend/src/main/resources/static
# Copy backend code
COPY Backend/pom.xml /app/Backend/
COPY Backend/src /app/Backend/src
# Build the JAR
RUN mvn -f /app/Backend/pom.xml clean package -DskipTests

# Stage 3: Final Runtime Image
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the JAR from the builder stage
COPY --from=backend-builder /app/Backend/target/*.jar app.jar
# Expose the default port (8081)
EXPOSE 8081
# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
