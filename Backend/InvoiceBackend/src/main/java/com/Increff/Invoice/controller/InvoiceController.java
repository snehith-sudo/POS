package com.Increff.Invoice.controller;

import com.Increff.Invoice.dto.InvoiceDTO;
import com.Increff.Invoice.model.InvoiceForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoice")
public class InvoiceController {

    @Autowired
    private InvoiceDTO invoiceDto;

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<String> generateInvoice(
            @RequestBody List<InvoiceForm> forms) {

        String base64 = invoiceDto.processInvoice(forms);
        return ResponseEntity.ok(base64);
    }
}


