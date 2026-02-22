package com.Increff.Invoice.api;

import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.Increff.Invoice.model.InvoiceEntity;

@Service
public class InvoiceApi {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateBase64(List<InvoiceEntity> entities) {

        if (entities == null || entities.isEmpty()) {
            throw new IllegalArgumentException("Invoice data cannot be empty");
        }

        try {
            Map<String, Object> payload = new HashMap<>();

            // Meta data
            payload.put("orderId", entities.getFirst().getOrderId());
            payload.put("invoiceDate", LocalDateTime.now().toString());

            // ALL invoice data (every item, every field)
            payload.put("items", entities);

            // Derived data
            double totalAmount = entities.stream()
                    .mapToDouble(e -> e.getQuantity() * e.getSellingPrice())
                    .sum();

            payload.put("totalAmount", totalAmount);

            // Serialize + Base64 encode
            String json = objectMapper.writeValueAsString(payload);
            return Base64.getEncoder()
                    .encodeToString(json.getBytes(StandardCharsets.UTF_8));

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice Base64", e);
        }
    }
}
