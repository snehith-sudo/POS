package com.increff.project.entity;


import jakarta.persistence.*;

import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "OrderItem",
        uniqueConstraints = @UniqueConstraint(name="uk_orderItems_orderId_productId",
        columnNames = {"order_id","product_id"}))
public class OrderItemPojo extends BasePojo {

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer orderedQty;

    @Column(nullable = false)
    private Double sellingPrice;
}