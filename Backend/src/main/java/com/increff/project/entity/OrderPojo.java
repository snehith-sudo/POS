package com.increff.project.entity;

import com.increff.project.model.constants.OrderStatus;
import jakarta.persistence.*;

import java.time.ZonedDateTime;

import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "Orders")
public class OrderPojo extends BasePojo {

    @Column(nullable = false)
    private ZonedDateTime orderTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

}