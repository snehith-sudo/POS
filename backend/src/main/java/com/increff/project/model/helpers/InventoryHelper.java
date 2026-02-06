package com.increff.project.model.helpers;

import com.increff.project.model.form.InventoryForm;
import com.increff.project.entity.InventoryPojo;

public class InventoryHelper {
    public static InventoryPojo convertFormToEntity(InventoryForm form)
    {
        InventoryPojo Item = new InventoryPojo();
        Item.setQuantity(form.getQuantity());
        return Item;
    }
}
