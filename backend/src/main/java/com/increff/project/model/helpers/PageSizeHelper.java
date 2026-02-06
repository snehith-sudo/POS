package com.increff.project.model.helpers;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PageSizeHelper {
    @NotNull
    @Positive
    private int page;

    @NotNull
    @Positive
    private int size;
}
