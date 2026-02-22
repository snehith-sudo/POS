package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductForm {

    @NotNull(message = "Client name is required")
    @NotBlank(message = "Client name should not be blank")
    private String clientName;

    @NotBlank(message = "Product name cannot be empty")
    private String name;

    @Positive(message = "Product mrp must be greater than 0")
    private Double mrp;

    @NotBlank(message = "Barcode cannot be empty")
    private String barcode;

    @NotBlank(message = "ImageUrl cant be empty")
    private String imageUrl;

    private Long version;
}
