package com.increff.project.dto;

import com.increff.project.model.data.DailySalesData;
import com.increff.project.model.data.SalesReportData;
import com.increff.project.useCase.SalesReportUseCase;
import com.increff.project.model.form.SalesReportClientForm;
import com.increff.project.model.form.SalesReportDatesClientForm;
import com.increff.project.model.form.DatesForm;
import com.increff.project.model.form.PageSizeForm;
import com.increff.project.utils.helpers.AbstractValidateNormalize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import static com.increff.project.utils.utils.SalesReportUtil.convertFormToEntity;


@Component
public class SalesReportDTO extends AbstractValidateNormalize {

    @Autowired
    private SalesReportUseCase salesReportUseCase;

    public Page<SalesReportData> getAllData(PageSizeForm form) {
        return salesReportUseCase.getAllData(form.getPage(),form.getSize());
    }

    public DailySalesData getDaySales(DatesForm form) {
        return convertFormToEntity(salesReportUseCase.getDaySales(form.getStartDate(),
                                                               form.getEndDate()));
    }

    public Page<SalesReportData> findSalesRawByClientName(SalesReportClientForm form) {
        form.setClientName(NormalizeValidateString(form.getClientName(),"Client Name"));
        return salesReportUseCase.findSalesRawByClientName(form.getClientName(),
                                                        form.getPage(),form.getSize());
    }

    public Page<SalesReportData> findSalesByDateRange(DatesForm form){
        return salesReportUseCase.findSalesByDateRange(form.getStartDate(),
                                                    form.getEndDate(),
                                                    form.getPage(),form.getSize());
    }
    public Page<SalesReportData> findSalesByDateRangeAndClient(SalesReportDatesClientForm form)
    {
        form.setClientName(NormalizeValidateString(form.getClientName(),"Client Name"));
        return salesReportUseCase.findSalesByDateRangeAndClient(form.getStartDate(),
                                                             form.getEndDate(),
                                                             form.getClientName(),
                                                             form.getPage(), form.getSize());
    }

}
