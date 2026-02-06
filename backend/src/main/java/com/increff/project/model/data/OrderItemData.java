package com.increff.project.model.data;

import lombok.Data;

@Data
public class OrderItemData {

    private int orderItemId;
    private int orderId;
    private int productId;
    private int orderedQty;
    private double sellingPrice;
}
