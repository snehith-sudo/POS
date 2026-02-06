package com.increff.project.controller;

import com.increff.project.model.data.SalesReportData;
import com.increff.project.dto.SalesReportDTO;
import com.increff.project.model.form.SalesReportClientForm;
import com.increff.project.model.form.SalesReportDatesClientForm;
import com.increff.project.model.form.SalesReportDatesForm;
import com.increff.project.model.helpers.PageSizeHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/salesreport")
@CrossOrigin(origins = "http://localhost:3000")
public class SalesReportController {

    @Autowired
    private SalesReportDTO salesReportDTO;

    @RequestMapping(method = RequestMethod.GET)
    public List<Map<String, Object>> getAllData() {
        return salesReportDTO.getAllData();
    }

    @RequestMapping(method = RequestMethod.POST,path = "/pages")
    public List<SalesReportData> getAllPaginatedDailyReport(@RequestBody PageSizeHelper form)
    {
        return salesReportDTO.getAllPaginatedDailyReport(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/getdaysales")
    public SalesReportData getDaySales(@RequestBody SalesReportDatesForm form) {
        return salesReportDTO.getDaySales(form);
    }

    @RequestMapping(method = RequestMethod.POST)
    public List<Map<String, Object>> findSalesRawByClientName(@RequestBody SalesReportClientForm form)
    {
        return salesReportDTO.findSalesRawByClientName(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/byDates")
    public List<Map<String, Object>> findSalesByDateRange(@RequestBody SalesReportDatesForm form) {
        return salesReportDTO.findSalesByDateRange(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/byDatesClient")
    public List<Map<String, Object>> findSalesByDateRangeAndClient(@RequestBody SalesReportDatesClientForm form)
    {
        return salesReportDTO.findSalesByDateRangeAndClient(form);
    }


}
