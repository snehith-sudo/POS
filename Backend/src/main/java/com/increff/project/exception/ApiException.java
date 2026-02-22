package com.increff.project.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }
}
