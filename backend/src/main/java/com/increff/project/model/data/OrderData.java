package com.increff.project.model.data;

import com.increff.project.entity.OrderStatus;
import lombok.Data;

import java.time.Instant;
import java.time.ZonedDateTime;

@Data
public class OrderData {

    private  int id;
    private ZonedDateTime orderTime;
    private OrderStatus status;
}
