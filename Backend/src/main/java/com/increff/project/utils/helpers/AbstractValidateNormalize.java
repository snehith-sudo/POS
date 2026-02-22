package com.increff.project.utils.helpers;

import com.increff.project.exception.ApiException;
import java.util.Objects;

public abstract class AbstractValidateNormalize {

    protected static String NormalizeValidateString(String value, String fieldName) {
        if (Objects.isNull(value)) {
            throw new ApiException(fieldName + " is not provided");
        }
        value = value.trim();

        if (value.isEmpty()) {
            throw new ApiException(fieldName + " cannot be empty or blank");
        }
        value = value.replaceAll("\\s+", " ")
                .toLowerCase();
        return value;
    }

    protected static void NormalizeValidateInteger(Integer value, String fieldName) {
        if (Objects.isNull(value)) {
            throw new ApiException(fieldName + " is not provided");
        }
        if (value < 0) {
            throw new ApiException(fieldName + " cannot be negative");
        }
    }
    protected static Double NormalizeValidateDouble(Double value, String fieldName) {
        if (value == null) {
            throw new ApiException(fieldName + " is not provided");
        }
        if (value < 0) {
            throw new ApiException(fieldName + " cannot be negative");
        }
        return Math.round(value * 100.0) / 100.0;
    }

}
