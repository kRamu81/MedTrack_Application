package com.medtrack.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * ValidationErrorResponse encapsulates validation errors mapped by field name.
 * Prevents exposing raw exception traces and provides structured messages. ''
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {

    private String message;
    private Map<String, String> errors;
}
