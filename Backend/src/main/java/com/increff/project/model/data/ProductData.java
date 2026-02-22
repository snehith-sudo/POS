package com.increff.project.model.data;

import lombok.Data;


@Data
public class ProductData
{
    private Long id;
    private String barcode;
    private String clientName;
    private String name;
    private Double mrp;
    private String imageUrl;
    private Long version;
}
