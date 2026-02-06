package com.increff.project.model.form;

import com.increff.project.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderForm {

    @NotNull
    private Integer orderId;

    private OrderStatus status;
}
