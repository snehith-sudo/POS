package com.increff.project.model.utils;

import lombok.Data;

import java.util.List;

@Data
public class InvoiceData {
    private double totalAmount;
    private int orderId;
    private String invoiceDate;
    private List<InvoiceItem> items;
}