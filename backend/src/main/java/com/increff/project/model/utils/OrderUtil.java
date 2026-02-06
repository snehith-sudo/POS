package com.increff.project.model.utils;

import com.increff.project.model.data.OrderData;
import com.increff.project.entity.OrderPojo;

public class OrderUtil {
    public static OrderData convertEntityToData(OrderPojo entity) {
        OrderData data = new OrderData();
        data.setOrderTime(entity.getOrderTime());
        data.setId(entity.getId());
        data.setStatus(entity.getStatus());
        return data;
    }
}
