package com.increff.project.controller;

import com.increff.project.model.data.DailySalesData;
import com.increff.project.dto.SalesReportDTO;
import com.increff.project.model.data.SalesReportData;
import com.increff.project.model.form.SalesReportClientForm;
import com.increff.project.model.form.SalesReportDatesClientForm;
import com.increff.project.model.form.DatesForm;
import com.increff.project.model.form.PageSizeForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/salesreport")
public class SalesReportController {

    @Autowired
    private SalesReportDTO salesReportDTO;

    @RequestMapping(method = RequestMethod.POST,path = "/pages")
    public Page<SalesReportData> getAllData(@RequestBody PageSizeForm form) {
        return salesReportDTO.getAllData(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/getdaysales")
    public DailySalesData getDaySales(@RequestBody DatesForm form) {
        return salesReportDTO.getDaySales(form);
    }

    @RequestMapping(method = RequestMethod.POST)
    public Page<SalesReportData> findSalesRawByClientName(@RequestBody SalesReportClientForm form)
    {
        return salesReportDTO.findSalesRawByClientName(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/byDates")
    public Page<SalesReportData> findSalesByDateRange(@RequestBody DatesForm form) {
        return salesReportDTO.findSalesByDateRange(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/byDatesClient")
    public Page<SalesReportData> findSalesByDateRangeAndClient(@RequestBody SalesReportDatesClientForm form)
    {
        return salesReportDTO.findSalesByDateRangeAndClient(form);
    }


}
