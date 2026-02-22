package com.increff.project.model.data;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class DailySalesData {
    private ZonedDateTime date;
    private Integer invoicedOrdersCount;
    private Integer invoicedItemsCount;
    private Double totalRevenue;
}
