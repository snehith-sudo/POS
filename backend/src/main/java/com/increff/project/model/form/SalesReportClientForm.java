package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SalesReportClientForm {

    @NotBlank(message = "Product name cannot be empty")
    private String clientName;
}
