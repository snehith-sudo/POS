package com.Increff.Invoice.util;

import com.Increff.Invoice.model.InvoiceEntity;
import com.Increff.Invoice.model.InvoiceForm;

public class InvoiceUtil {
    public static InvoiceEntity convertFormtoEntity(InvoiceForm form)
    {
        InvoiceEntity entity = new InvoiceEntity();

        entity.setOrderId(form.getOrderId());
        entity.setName(form.getProductName());
        entity.setBarcode(form.getBarcode());
        entity.setQuantity(form.getQuantity());
        entity.setSellingPrice(form.getSellingPrice());

        return entity;
    }
}
