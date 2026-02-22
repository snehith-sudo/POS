package com.increff.project.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "product",uniqueConstraints = @UniqueConstraint(name="uk_product_productId",
        columnNames = {"barcode"}))
public class ProductPojo extends BasePojo {

    @Column(unique = true)
    private String barcode;

    @Column(nullable = false)
    private Long clientId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double mrp;

    @Column
    private String imageUrl;
}