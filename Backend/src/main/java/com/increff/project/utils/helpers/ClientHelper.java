package com.increff.project.utils.helpers;

import com.increff.project.model.form.ClientForm;
import com.increff.project.entity.ClientPojo;

public class ClientHelper{

    public static ClientPojo convertFormToEntity(ClientForm form)
    {
        ClientPojo entity = new ClientPojo();
        entity.setName((form.getName()).toLowerCase());
        return entity;
    }
}
