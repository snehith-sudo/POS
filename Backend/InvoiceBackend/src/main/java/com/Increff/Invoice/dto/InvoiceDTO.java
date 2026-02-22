package com.Increff.Invoice.dto;

import com.Increff.Invoice.api.InvoiceApi;
import com.Increff.Invoice.model.InvoiceEntity;
import com.Increff.Invoice.model.InvoiceForm;
import org.springframework.stereotype.Component;
import static com.Increff.Invoice.util.InvoiceUtil.convertFormtoEntity;

import java.util.ArrayList;
import java.util.List;

@Component
public class InvoiceDTO {

    private final InvoiceApi invoiceApi;

    public InvoiceDTO(InvoiceApi invoiceApi) {
        this.invoiceApi = invoiceApi;
    }

    public String processInvoice(List<InvoiceForm> forms) {
        List<InvoiceEntity> entities = new ArrayList<>();
        for(InvoiceForm form:forms) entities.add(convertFormtoEntity(form));

        return invoiceApi.generateBase64(entities);
    }
}