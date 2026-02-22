package com.increff.project.utils.helpers;

import com.increff.project.model.data.OrderItemData;
import com.increff.project.model.form.InvoiceForm;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class InvoiceHelper {
    public static List<InvoiceForm> convertOrderItemsToInvoiceForm(List<OrderItemData> Items)
    {
        List<InvoiceForm> InvoiceItems = new ArrayList<>();

        for(OrderItemData item:Items) {
            InvoiceForm entity = new InvoiceForm();

            entity.setOrderId(item.getOrderId());
            entity.setProductName(item.getName());
            entity.setBarcode(item.getBarcode());
            entity.setQuantity(item.getOrderedQty());
            entity.setSellingPrice(item.getSellingPrice());
            InvoiceItems.add(entity);
        }
        return InvoiceItems;
    }
}
