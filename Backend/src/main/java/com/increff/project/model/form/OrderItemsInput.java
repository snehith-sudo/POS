package com.increff.project.model.form;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderItemsInput {

    @NotNull
    private Integer id;
}
