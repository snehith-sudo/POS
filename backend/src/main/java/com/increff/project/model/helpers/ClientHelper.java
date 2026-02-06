package com.increff.project.model.helpers;

import com.increff.project.model.form.ClientForm;
import com.increff.project.entity.ClientPojo;

//TODO Converts folder should be in Utils
//TODO Generic converters

public class ClientHelper{

    public static ClientPojo convertFormToEntity(ClientForm form)
    {
        ClientPojo entity = new ClientPojo();
        entity.setName((form.getName()).toLowerCase());
        return entity;
    }
}
