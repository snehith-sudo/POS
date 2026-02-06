package com.increff.project.model.utils;

import com.increff.project.model.data.OrderItemData;
import com.increff.project.entity.OrderItemPojo;

public class OrderItemUtil {
    public static OrderItemData convertEntityToData(OrderItemPojo entity) {
        OrderItemData data = new OrderItemData();
        data.setOrderItemId(entity.getOrderItemId());
        data.setOrderId(entity.getOrderId());
        data.setOrderedQty(entity.getOrderedQty());
        data.setSellingPrice(entity.getSellingPrice());
        data.setProductId(entity.getProductId());
        return data;
    }
}
