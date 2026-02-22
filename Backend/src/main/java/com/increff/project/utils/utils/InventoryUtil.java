package com.increff.project.utils.utils;

import com.increff.project.entity.ProductPojo;
import com.increff.project.model.data.InventoryData;
import com.increff.project.entity.InventoryPojo;

import java.util.Objects;

public class InventoryUtil {

    public static InventoryData convertEntityToData(InventoryPojo inventory, ProductPojo product)
    {
        if(Objects.isNull(inventory) || Objects.isNull(product)){
            return null;
        }
        InventoryData data = new InventoryData();
        data.setId(inventory.getId());
        data.setQuantity(inventory.getQuantity());
        data.setName(product.getName());
        data.setBarcode(product.getBarcode());
        data.setMrp(product.getMrp());
        data.setVersion(product.getVersion());
        return data;
    }
}
