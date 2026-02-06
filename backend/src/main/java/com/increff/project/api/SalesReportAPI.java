package com.increff.project.api;

import com.increff.project.dao.SalesReportDAO;
import com.increff.project.entity.SalesReportPojo;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<Map<String, Object>> getAllData(){
        return salesReportDao.getAllData();
    }

    @Transactional(readOnly = true)
    public SalesReportPojo getDaySales(ZonedDateTime start, ZonedDateTime end) {
        return salesReportDao.getDaySales(start,end);
    }

    @Transactional(readOnly = true)
    public List<SalesReportPojo> getAllPaginatedDailyReport(int page, int size)
    {return salesReportDao.getAllPaginatedDailyReport(page,size);}


    @Transactional(readOnly = true)
    public List<Map<String, Object>> findSalesRawByClientName(String clientName) {
        return salesReportDao.getSalesReportByClient(clientName);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findSalesByDateRange(ZonedDateTime startDate,ZonedDateTime endDate)
    {
        return salesReportDao.findSalesByDateRange(startDate,endDate);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> findSalesByDateRangeAndClient(ZonedDateTime startDate,ZonedDateTime endDate,String clientName)
    {
        return salesReportDao.findSalesByDateRangeAndClient(startDate,endDate,clientName);
    }

    @Transactional(rollbackFor = Exception.class)
    public void saveDaySalesReport(ZonedDateTime startDate,ZonedDateTime endDate)
    {
        salesReportDao.saveDaySalesReport(startDate,endDate);
    }

}
