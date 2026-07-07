package com.medtrack.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link GlobalExceptionHandler} to ensure all captured exceptions return correct HTTP statuses and structured payloads.
 */
@ExtendWith(MockitoExtension.class)
public class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    // Helper method to extract a real MethodParameter via reflection
    public void dummyMethod(String dummy) {}

    @Test
    void handleValidationExceptions_Success() throws NoSuchMethodException {
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("registerRequest", "email", "Email must be valid");
        when(bindingResult.getFieldErrors()).thenReturn(Collections.singletonList(fieldError));

        java.lang.reflect.Method method = GlobalExceptionHandlerTest.class.getMethod("dummyMethod", String.class);
        MethodParameter methodParameter = new MethodParameter(method, 0);

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                methodParameter,
                bindingResult
        );

        ResponseEntity<ValidationErrorResponse> response = globalExceptionHandler.handleValidationExceptions(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Validation failed", response.getBody().getMessage());
        assertEquals("Email must be valid", response.getBody().getErrors().get("email"));
    }

    @Test
    void handleBadCredentials_Success() {
        BadCredentialsException ex = new BadCredentialsException("Invalid username or password");

        ResponseEntity<Map<String, String>> response = globalExceptionHandler.handleBadCredentials(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Invalid username or password", response.getBody().get("message"));
    }

    @Test
    void handleRuntimeException_Success() {
        RuntimeException ex = new RuntimeException("Something went wrong");

        ResponseEntity<Map<String, String>> response = globalExceptionHandler.handleRuntimeException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Something went wrong", response.getBody().get("message"));
    }

    @Test
    void handleGeneralException_Success() {
        Exception ex = new Exception("General internal error");

        ResponseEntity<Map<String, String>> response = globalExceptionHandler.handleGeneralException(ex);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("An unexpected error occurred", response.getBody().get("message"));
    }
}
