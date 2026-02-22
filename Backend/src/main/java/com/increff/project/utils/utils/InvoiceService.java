package com.increff.project.utils.utils;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;

import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;


@Service
public class InvoiceService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public byte[] generateInvoiceFromBase64(String base64Data) {
        try {
            // 1. Decode Base64
            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
            String json = new String(decodedBytes, StandardCharsets.UTF_8);

            // 2. Convert JSON → POJO
            InvoiceData invoiceData =
                    objectMapper.readValue(json, InvoiceData.class);

            // 3. Generate PDF
            return generatePdf(invoiceData);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }
    private byte[] generatePdf(InvoiceData invoice) throws Exception {

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // PDF content generation
        document.add(new Paragraph("INVOICE"));
        document.add(new Paragraph("POS System").setBold().setFontSize(16));
        document.add(new Paragraph("INVOICE").setBold());

        document.add(new Paragraph("Order #: " + invoice.getOrderId()));
        document.add(new Paragraph("Date: " + invoice.getInvoiceDate()));
        document.add(new Paragraph("\n"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 4, 2, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100));

        table.addHeaderCell("No");
        table.addHeaderCell("Product");
        table.addHeaderCell("Barcode");
        table.addHeaderCell("Qty");
        table.addHeaderCell("Price");

        int i = 1;
        for (InvoiceItem item : invoice.getItems()) {
            table.addCell(String.valueOf(i++));
            table.addCell(item.getName());
            table.addCell(item.getBarcode());
            table.addCell(String.valueOf(item.getQuantity()));
            table.addCell(String.valueOf(item.getSellingPrice()));
        }

        document.add(table);

        document.add(new Paragraph("\nGrand Total: ₹" + invoice.getTotalAmount()).setBold());

        document.close();

        byte[] pdfBytes = baos.toByteArray();

        // SAVE TO FILE SYSTEM
        Path path = Paths.get("invoices/invoice-" + invoice.getOrderId() + ".pdf");
        Files.createDirectories(path.getParent());
        Files.write(path, pdfBytes);

        return pdfBytes;
    }

    private void addHeader(Table table, String text) {
        table.addHeaderCell(
                new Cell()
                        .add(new Paragraph(text).setBold())
        );
    }
}

