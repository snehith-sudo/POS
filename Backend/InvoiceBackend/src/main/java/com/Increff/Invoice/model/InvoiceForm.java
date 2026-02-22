package com.Increff.Invoice.model;

import lombok.Data;
import jakarta.validation.constraints.NotNull;


@Data
public class InvoiceForm {

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
