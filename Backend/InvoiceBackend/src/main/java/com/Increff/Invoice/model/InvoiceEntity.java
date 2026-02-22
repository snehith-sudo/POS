package com.Increff.Invoice.model;

import lombok.Data;

@Data
public class InvoiceEntity {
    private int orderId;
    private String name;
    private String barcode;
    private int quantity;
    private double sellingPrice;
}
