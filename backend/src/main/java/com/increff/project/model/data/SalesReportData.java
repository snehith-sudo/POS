package com.increff.project.model.data;

import lombok.Data;

import java.time.Instant;
import java.time.ZonedDateTime;

@Data
public class SalesReportData {
    private ZonedDateTime date;
    private int invoicedOrdersCount;
    private int invoicedItemsCount;
    private double totalRevenue;
}
