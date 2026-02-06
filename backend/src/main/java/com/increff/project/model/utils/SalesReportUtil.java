package com.increff.project.model.utils;

import com.increff.project.model.data.SalesReportData;
import com.increff.project.entity.SalesReportPojo;

public class SalesReportUtil {
    public  static SalesReportData convertFormToEntity(SalesReportPojo report)
    {
        SalesReportData data = new SalesReportData();
        data.setDate(report.getDate());
        data.setInvoicedOrdersCount(report.getInvoicedOrdersCount());
        data.setInvoicedItemsCount(report.getInvoicedItemsCount());
        data.setTotalRevenue(report.getTotalRevenue());
        return data;
    }
}
