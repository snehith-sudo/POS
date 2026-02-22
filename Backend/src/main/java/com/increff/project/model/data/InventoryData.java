package com.increff.project.model.data;

import lombok.Data;


@Data
public class InventoryData {
    private Long id;
    private String name;
    private String barcode;
    private Integer quantity;
    private Double mrp;
    private Long version;
}
