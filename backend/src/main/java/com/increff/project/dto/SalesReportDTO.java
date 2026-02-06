package com.increff.project.dto;

import com.increff.project.model.data.SalesReportData;
import com.increff.project.model.helpers.PageSizeHelper;
import com.increff.project.model.utils.ClientUtil;
import com.increff.project.model.utils.SalesReportUtil;
import com.increff.project.useCase.SalesReportFlow;
import com.increff.project.model.form.SalesReportClientForm;
import com.increff.project.model.form.SalesReportDatesClientForm;
import com.increff.project.model.form.SalesReportDatesForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.increff.project.model.utils.SalesReportUtil.convertFormToEntity;

@Component
public class SalesReportDTO {

    @Autowired
    private SalesReportFlow salesReportFlow;

    public List<Map<String, Object>> getAllData()
    {
        return salesReportFlow.getAllData();
    }

    public List<SalesReportData> getAllPaginatedDailyReport(PageSizeHelper form)
    {
        return salesReportFlow.getAllPaginatedDailyReport(form.getPage(),form.getSize())
                .stream()
                .map(SalesReportUtil::convertFormToEntity)
                .collect(Collectors.toList());
    }

    public SalesReportData getDaySales(SalesReportDatesForm form) {
        return convertFormToEntity(salesReportFlow.getDaySales(form.getStartDate(),form.getEndDate()));
    }

    public List<Map<String, Object>>findSalesRawByClientName(SalesReportClientForm form) {
        return salesReportFlow.findSalesRawByClientName(form.getClientName());
    }

    public List<Map<String, Object>> findSalesByDateRange(SalesReportDatesForm form){
        return salesReportFlow.findSalesByDateRange(form.getStartDate(),form.getEndDate());
    }
    public List<Map<String, Object>> findSalesByDateRangeAndClient(SalesReportDatesClientForm form)
    {
        return salesReportFlow.findSalesByDateRangeAndClient(form.getStartDate(),form.getEndDate(),form.getClientName());
    }

}
