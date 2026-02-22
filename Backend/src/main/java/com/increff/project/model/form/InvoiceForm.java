package com.increff.project.model.form;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvoiceForm {
        @NotNull(message = "Quantity value is required")
        private Long orderId;

        @NotNull
        private String productName;
        @NotNull
        private String barcode;
        @NotNull
        private Integer quantity;
        @NotNull
        private Double sellingPrice;
}
