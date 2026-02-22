package com.increff.project.api;

import com.increff.project.dao.SalesReportDAO;
import com.increff.project.entity.SalesReportPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.model.data.SalesReportData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@Service
public class SalesReportAPI {

    @Autowired
    private SalesReportDAO salesReportDao;

    @Transactional(readOnly = true)
    public Page<SalesReportData> getAllData(int page,int size) {

        List<SalesReportData> salesReportData =  salesReportDao.getAllData(page,size);
        long totalElements = salesReportDao.countRowsOfAllData();

        PageRequest pageRequest = PageRequest.of(page, size);
        return new PageImpl<>(salesReportData, pageRequest, totalElements);
    }

    @Transactional(readOnly = true)
    public SalesReportPojo getDaySales(ZonedDateTime start, ZonedDateTime end) {

        return salesReportDao.getDaySales(start,end);
    }

    @Transactional(readOnly = true)
    public List<SalesReportPojo> getAllPaginatedDailyReport(int page, int size) {

        return salesReportDao.getAllPaginatedDailyReport(page,size);
    }

    @Transactional(readOnly = true)
    public Page<SalesReportData> findSalesRawByClientName(String clientName,int page,int size) {

        List<SalesReportData> salesReportData =  salesReportDao.getSalesReportByClient(clientName,page,size);
        long totalElements = salesReportDao.countRowsByClient(clientName);

        PageRequest pageRequest = PageRequest.of(page, size);
        return new PageImpl<>(salesReportData, pageRequest, totalElements);
    }


    @Transactional(readOnly = true)
    public Page<SalesReportData> findSalesByDateRange(ZonedDateTime startDate,ZonedDateTime endDate,int page,int size) {

        List<SalesReportData> salesReportData = salesReportDao.findSalesByDateRange(startDate,endDate,page,size);
        long totalElements = salesReportDao.countRowsByDates(startDate,endDate);

        PageRequest pageRequest = PageRequest.of(page, size);
        return new PageImpl<>(salesReportData, pageRequest, totalElements);
    }


    @Transactional(readOnly = true)
    public Page<SalesReportData> findSalesByDateRangeAndClient(ZonedDateTime startDate,ZonedDateTime endDate,String clientName,int page,int size) {

        List<SalesReportData> salesReportData = salesReportDao.findSalesByDateRangeAndClient(startDate,endDate,clientName,page,size);
        long totalElements = salesReportDao.countRowsByDateClient(startDate,endDate,clientName);

        PageRequest pageRequest = PageRequest.of(page, size);
        return new PageImpl<>(salesReportData, pageRequest, totalElements);
    }


    @Transactional(rollbackFor = Exception.class)
    public void saveDaySalesReport(ZonedDateTime startDate,
                                   ZonedDateTime endDate)  throws ApiException {

        salesReportDao.saveDaySalesReport(startDate,endDate);
    }

}
