package com.increff.project.model.form;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PageSizeForm {
    @NotNull
    @Positive
    private Integer page;

    @NotNull
    @Positive
    private Integer size;
}
