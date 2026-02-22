package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InventoryForm {

    private Integer id;
    private Integer quantity;
    private String barcode;
    private Long version;
}
