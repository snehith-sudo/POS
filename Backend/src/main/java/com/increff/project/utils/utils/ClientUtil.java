package com.increff.project.utils.utils;

import com.increff.project.model.data.ClientData;
import com.increff.project.entity.ClientPojo;

public class ClientUtil {

    public static ClientData clientDataConvert(ClientPojo entity) {
        ClientData data = new ClientData();
        data.setId(entity.getId());
        data.setName(entity.getName());
        return data;
    }
}
