package com.increff.project.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "pos_day_sales",uniqueConstraints = @UniqueConstraint(name="uk_salesReport",
        columnNames = {"date"}))
public class SalesReportPojo extends BasePojo {

    //TODO Integer Double ZoneDateTime -> DONE
    //TODO dont use primitive types -> DONE

    @Column(nullable = false)
    private ZonedDateTime date;

    @Column(nullable = false)
    private Integer invoicedOrdersCount;

    @Column(nullable = false)
    private Integer invoicedItemsCount;

    @Column(nullable = false)
    private Double totalRevenue;
}
