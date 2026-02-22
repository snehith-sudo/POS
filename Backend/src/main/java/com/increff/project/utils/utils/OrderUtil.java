package com.increff.project.utils.utils;

import com.increff.project.entity.OrderPojo;
import com.increff.project.model.data.OrderData;

public class OrderUtil {
    public static OrderData convertEntityToData(OrderPojo entity) {
        OrderData data = new OrderData();
        data.setOrderTime(entity.getOrderTime());
        data.setId(entity.getId());
        data.setStatus(entity.getStatus());
        return data;
    }
}
