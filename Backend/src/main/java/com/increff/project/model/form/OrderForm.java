package com.increff.project.model.form;

import com.increff.project.model.constants.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderForm {

    @NotNull
    private Integer orderId;

    // can remove this
    private OrderStatus status;
}
