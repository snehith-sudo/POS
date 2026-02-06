package com.increff.project.model.helpers;

import com.increff.project.exception.ApiException;
import java.util.Objects;

public abstract class AbstractValidateNormalize {

    protected static void validateNormalizeString(String value, String fieldName) {
        if (Objects.isNull(value)) {
            throw new ApiException(fieldName + " is not provided");
        }
        value = value.trim();

        if (value.isEmpty()) {
            throw new ApiException(fieldName + " cannot be empty or blank");
        }
        value = value.replaceAll("\\s+", " ")
                .toLowerCase();
    }

    protected static void validateNormalizeInteger(Integer value, String fieldName) {
        if (Objects.isNull(value)) {
            throw new ApiException(fieldName + " is not provided");
        }
        if (value < 0) {
            throw new ApiException(fieldName + " cannot be negative");
        }
    }
    protected static void validateNormalizeDouble(Double value, String fieldName) {
        if (Objects.isNull(value)) {
            throw new ApiException(fieldName + " is not provided");
        }
        if (value < 0) {
            throw new ApiException(fieldName + " cannot be negative");
        }
    }
}
