package com.increff.project.utils.utils;

import com.increff.project.entity.ClientPojo;
import com.increff.project.entity.ProductPojo;
import com.increff.project.model.data.ProductData;

public class ProductUtil {

    public static ProductData convertProductEntityToData(ProductPojo entity, String clientName) {

        ProductData data = new ProductData();
        data.setId(entity.getId());
        data.setName(entity.getName());
        data.setMrp(entity.getMrp());
        data.setBarcode(entity.getBarcode());
        data.setImageUrl(entity.getImageUrl());
        data.setVersion(entity.getVersion());
        data.setClientName(clientName);

        return data;
    }
}
