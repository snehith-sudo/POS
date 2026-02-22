package com.increff.project.model.form;

import lombok.Data;

@Data
public class ProductFilterForm {
    private String barcode;
    private String clientName;
    private Integer page;
    private Integer size;
}
