package com.increff.project.utils.helpers;

import com.increff.project.model.form.OrderItemForm;
import com.increff.project.entity.OrderItemPojo;

public class OrderHelper {
    public static OrderItemPojo convertFormToEntity(OrderItemForm form) {

        OrderItemPojo orderItem = new OrderItemPojo();
        orderItem.setOrderedQty(form.getOrderedQty());
        orderItem.setSellingPrice(form.getSellingPrice());
        return orderItem;
    }
}
