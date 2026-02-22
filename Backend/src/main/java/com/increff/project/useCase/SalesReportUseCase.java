package com.increff.project.useCase;

import com.increff.project.api.*;
import com.increff.project.entity.SalesReportPojo;
import com.increff.project.model.data.SalesReportData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class SalesReportUseCase {

    @Autowired
    private SalesReportAPI salesReportApi;

    public Page<SalesReportData> getAllData(int page,int size) {
        return salesReportApi.getAllData(page,size);
    }

    @Transactional(readOnly = true)
    public SalesReportPojo getDaySales(ZonedDateTime start, ZonedDateTime end) {
        return salesReportApi.getDaySales(start,end);
    }

    @Transactional(readOnly = true)
    public List<SalesReportPojo> getAllPaginatedDailyReport(int page,int size) {
        return salesReportApi.getAllPaginatedDailyReport(page,size);
    }

    @Transactional(readOnly = true)
    public Page<SalesReportData> findSalesRawByClientName(String clientName,int page,int size) {
        return salesReportApi.findSalesRawByClientName(clientName,page,size);
    }

    @Transactional(readOnly = true)
    public Page<SalesReportData> findSalesByDateRange(ZonedDateTime startDate,
                                                      ZonedDateTime endDate,int page,int size) {
        return salesReportApi.findSalesByDateRange(startDate,endDate,page,size);
    }

    @Transactional(readOnly = true)
    public Page<SalesReportData> findSalesByDateRangeAndClient(ZonedDateTime startDate,
                                                               ZonedDateTime endDate,
                                                               String clientName,int page,int size) {
        return salesReportApi.findSalesByDateRangeAndClient(startDate,endDate,
                clientName,page,size);
    }

    @Transactional(rollbackFor = Exception.class)
    public void saveDaySalesReport(ZonedDateTime startDate,ZonedDateTime endDate) {
         salesReportApi.saveDaySalesReport(startDate,endDate);
    }
}
