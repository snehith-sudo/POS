package com.increff.project.useCase;

import com.increff.project.api.*;
import com.increff.project.entity.SalesReportPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SalesReportFlow {

    @Autowired
    private SalesReportAPI salesReportApi;

    public List<Map<String, Object>> getAllData()
    {
        return salesReportApi.getAllData();
    }

    @Transactional(readOnly = true)
    public SalesReportPojo getDaySales(ZonedDateTime start, ZonedDateTime end) {
        return salesReportApi.getDaySales(start,end);
    }

    @Transactional(readOnly = true)
    public List<SalesReportPojo> getAllPaginatedDailyReport(int page,int size)
    {
        return salesReportApi.getAllPaginatedDailyReport(page,size);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findSalesRawByClientName(String clientName)
    {
        return salesReportApi.findSalesRawByClientName(clientName);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findSalesByDateRange(ZonedDateTime startDate,ZonedDateTime endDate)
    {
        return salesReportApi.findSalesByDateRange(startDate,endDate);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findSalesByDateRangeAndClient(ZonedDateTime startDate,ZonedDateTime endDate,String clientName)
    {
        return salesReportApi.findSalesByDateRangeAndClient(startDate,endDate,clientName);
    }

    @Transactional(readOnly = true)
    public void saveDaySalesReport(ZonedDateTime startDate,ZonedDateTime endDate)
    {
         salesReportApi.saveDaySalesReport(startDate,endDate);
    }
}
