package com.increff.project.model.data;

import lombok.Data;

@Data
public class OrderItemData {

    private Long orderItemId;
    private String name;
    private String barcode;
    private Long orderId;
    private Long productId;
    private Integer orderedQty;
    private Double sellingPrice;
}
