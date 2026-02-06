package com.increff.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pos_day_sales")
public class SalesReportPojo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private int id;

    @Column(nullable = false)
    private ZonedDateTime date;

    @Column(nullable = false)
    private int invoicedOrdersCount;

    @Column(nullable = false)
    private int invoicedItemsCount;

    @Column(nullable = false)
    private double totalRevenue;
}
