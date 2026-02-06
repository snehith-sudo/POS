package com.increff.project.model.data;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ProductData
{
    private int id;
    private String barcode;
    private int clientId;
    private String name;
    private double mrp;
    private String imageUrl;
}
