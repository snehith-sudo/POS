package com.increff.project.entity;

import jakarta.persistence.*;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name="inventory",
        uniqueConstraints = @UniqueConstraint(name="uk_inventory_productId",
        columnNames = {"product_id"}))
public class InventoryPojo extends BasePojo {

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer quantity;
}