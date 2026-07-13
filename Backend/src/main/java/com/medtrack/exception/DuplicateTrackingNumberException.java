package com.medtrack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateTrackingNumberException extends RuntimeException {
    public DuplicateTrackingNumberException(String message) {
        super(message);
    }
}
