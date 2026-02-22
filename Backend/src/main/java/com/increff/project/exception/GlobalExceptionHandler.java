package com.increff.project.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends RuntimeException{

    // Handle Invalid Input (custom)
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleIllegalArgument(IllegalArgumentException ex) {
        return Map.of("error", ex.getMessage());
    }

    // Handle Validation Errors (from @Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidation(MethodArgumentNotValidException ex) {
        String error = ex.getBindingResult()
                .getFieldErrors()
                .getFirst()
                .getDefaultMessage();

        return Map.of("error", error);
    }

    // Handle Custom ApiException
    @ExceptionHandler(ApiException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleApi(ApiException ex){
        return Map.of("error", ex.getMessage());
    }

    // Fallback — handle all unhandled exceptions
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleGeneric(Exception ex) {

        ex.printStackTrace();

        // Find root cause
        Throwable rootCause = ex;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }

        String originalMessage = rootCause.getMessage();
        if (originalMessage == null) {
            originalMessage = "Unknown error occurred";
        }

        return Map.of(
                "error", "Internal Server Error",
                "detailedError", originalMessage
        );
    }
}
