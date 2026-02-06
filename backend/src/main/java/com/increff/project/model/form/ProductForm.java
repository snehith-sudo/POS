package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductForm {

    @NotNull(message = "Client ID is required")
    @Positive(message = "Client ID must be positive")
    private Integer clientId;

    @NotBlank(message = "Product name cannot be empty")
    private String name;

    @Positive(message = "Product mrp must be greater than 0")
    private Double mrp;

    @NotBlank(message = "Barcode cannot be empty")
    private String barcode;

    @NotBlank(message = "Image URL cannot be empty")
    private String imageUrl;
}
