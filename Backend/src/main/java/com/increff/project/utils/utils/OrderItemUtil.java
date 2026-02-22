package com.increff.project.utils.utils;

import com.increff.project.model.data.OrderItemData;

public class OrderItemUtil {
    public static OrderItemData convertEntityToData(OrderItemData entity) {
        OrderItemData data = new OrderItemData();
        data.setOrderId(entity.getOrderId());
        data.setOrderedQty(entity.getOrderedQty());
        data.setSellingPrice(entity.getSellingPrice());
        data.setProductId(entity.getProductId());
        data.setBarcode(entity.getBarcode());
        return data;
    }
}
