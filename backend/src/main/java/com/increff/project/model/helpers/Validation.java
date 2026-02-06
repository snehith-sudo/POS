package com.increff.project.model.helpers;

import com.increff.project.exception.ApiException;
import org.springframework.stereotype.Component;

@Component
public class Validation {
    public static void validateString(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new ApiException("Client name cannot be empty");
        }
    }
}
