package com.increff.project.model.form;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class OrderItemForm {

    @NotNull
    private String barcode;

    private Integer productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity ID must be positive")
    private Integer orderedQty;

    @NotNull(message = "Selling Price is required")
    @Positive(message = "Selling Price must be positive")
    private Double sellingPrice;
}
