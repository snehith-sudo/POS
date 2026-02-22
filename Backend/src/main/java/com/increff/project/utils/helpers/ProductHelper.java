package com.increff.project.utils.helpers;

import com.increff.project.model.form.ProductForm;
import com.increff.project.entity.ProductPojo;


public class ProductHelper{

    public static ProductPojo convertFormToEntity(ProductForm form)
    {
        ProductPojo product = new ProductPojo();

        product.setName(String.valueOf(form.getName()));
        product.setMrp(form.getMrp());
        product.setBarcode(form.getBarcode());
        product.setImageUrl(form.getImageUrl());

        return product;
    }
}
