package com.increff.project.entity;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvoicePojo
{
        @NotNull(message = "Quantity value is required")
        private int orderId;

        @NotNull
        private String productName;
        @NotNull
        private String barcode;
        @NotNull
        private int quantity;
        @NotNull
        private double sellingPrice;
}
