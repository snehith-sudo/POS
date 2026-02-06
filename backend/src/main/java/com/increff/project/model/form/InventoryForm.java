package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class InventoryForm {

    private int id;

    private int quantity;

    @NotNull
    @NotBlank
    private String barcode;
    //TODO check the NonNull checks for all forms
}
