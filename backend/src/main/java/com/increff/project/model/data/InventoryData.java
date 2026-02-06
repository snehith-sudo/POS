package com.increff.project.model.data;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InventoryData {
    private int id;
    private String name;
    private String barcode;
    private int quantity;
    private int mrp;
}
