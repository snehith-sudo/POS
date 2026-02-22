package com.increff.project.model.data;

import lombok.Data;

@Data
public class SalesReportData {
    private String clientName;
    private String barcode;
    private String productName;
    private Integer quantityOrdered;
    private double revenue;
}
