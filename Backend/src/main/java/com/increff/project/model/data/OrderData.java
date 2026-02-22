package com.increff.project.model.data;

import com.increff.project.model.constants.OrderStatus;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class OrderData {

    private  Long id;
    private ZonedDateTime orderTime;
    private OrderStatus status;
    private Long version;
}
