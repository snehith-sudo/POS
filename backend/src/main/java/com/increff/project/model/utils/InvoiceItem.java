package com.increff.project.model.utils;

import lombok.Data;

@Data
public class InvoiceItem {
    // This matches the "items" array in your JSON
    private String barcode;
    private String name;
    private int orderId;
    private int quantity;
    private double sellingPrice;
}