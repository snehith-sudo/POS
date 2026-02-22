package com.increff.project.utils.utils;

import com.increff.project.entity.SalesReportPojo;
import com.increff.project.model.data.DailySalesData;

public class SalesReportUtil {
    public  static DailySalesData convertFormToEntity(SalesReportPojo report)
    {
        DailySalesData data = new DailySalesData();
        data.setDate(report.getDate());
        data.setInvoicedOrdersCount(report.getInvoicedOrdersCount());
        data.setInvoicedItemsCount(report.getInvoicedItemsCount());
        data.setTotalRevenue(report.getTotalRevenue());
        return data;
    }
}
