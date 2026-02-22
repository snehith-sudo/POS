package com.increff.project.utils.utils;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class InvoiceUtil {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String INVOICE_URL = "http://localhost:8081/invoice";

    public String generateInvoice(Object request) {

        return restTemplate.postForObject(
                INVOICE_URL,
                request,
                String.class
        );
    }
}
