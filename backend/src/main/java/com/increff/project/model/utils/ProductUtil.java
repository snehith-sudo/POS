package com.increff.project.model.utils;

import com.increff.project.model.data.ProductData;
import com.increff.project.entity.ProductPojo;

public class ProductUtil {

    public static ProductData convertProductEntitytoForm(ProductPojo entity) {

        ProductData data = new ProductData();
        data.setId(entity.getId());
        data.setClientId(entity.getClientId());
        data.setName(entity.getName());
        data.setMrp(entity.getMrp());
        data.setBarcode(entity.getBarcode());
        data.setImageUrl(entity.getImageUrl());

        return data;
    }
}
