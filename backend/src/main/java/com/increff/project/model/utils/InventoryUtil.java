package com.increff.project.model.utils;

import com.increff.project.model.data.InventoryData;
import com.increff.project.entity.InventoryPojo;

public class InventoryUtil {

    public static InventoryData convertEntityToData(InventoryPojo entity) {
        InventoryData data = new InventoryData();
        data.setId(entity.getId());
        data.setQuantity(entity.getQuantity());
        return data;
    }
}
