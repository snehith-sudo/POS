package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SalesReportClientForm {

    @NotBlank(message = "Product name cannot be empty")
    private String clientName;

    @NotNull
    private Integer page;

    @NotNull
    private Integer size;
}
