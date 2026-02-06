package com.increff.project.useCase;

import com.increff.project.model.utils.InvoiceData;
import com.increff.project.model.utils.InvoiceItem;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service; // Optional: Remove if not using Spring

import java.io.OutputStream;

@Service // Optional annotation
public class InvoicePdfGenerator {
    
    public void generateInvoicePdf(InvoiceData data, OutputStream outputStream) {
        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // --- HEADER SECTION ---
            document.add(new Paragraph("INCREFF")
                    .setBold().setFontSize(20).setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Incredible Efficiency")
                    .setTextAlignment(TextAlignment.CENTER).setItalic());

            document.add(new Paragraph("POS System")
                    .setBold().setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("123 Main Street, City, Country\n+1-234-567-8900 | support@possystem.com")
                    .setTextAlignment(TextAlignment.CENTER).setFontSize(10));

            document.add(new Paragraph("\n")); // Spacer

            // --- INVOICE INFO ---
            document.add(new Paragraph("Invoice #: INV-" + data.getOrderId()).setBold());
            document.add(new Paragraph("Order #: " + data.getOrderId()).setBold());
            document.add(new Paragraph("Date: " + data.getInvoiceDate()));
            document.add(new Paragraph("Payment: CASH").setBold());

            document.add(new Paragraph("\n"));

            // --- PRODUCT TABLE ---
            // Columns: #, Product, Barcode, Qty, Unit Price, Total
            float[] columnWidths = {1, 4, 3, 1, 2, 2};
            Table table = new Table(UnitValue.createPercentArray(columnWidths)).useAllAvailableWidth();

            // Headers
            String[] headers = {"#", "Product", "Barcode", "Qty", "Unit Price", "Total"};
            for (String h : headers) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            }

            // Rows
            int count = 1;
            for (InvoiceItem item : data.getItems()) {
                double totalItemPrice = item.getQuantity() * item.getSellingPrice();

                table.addCell(new Cell().add(new Paragraph(String.valueOf(count++))));
                table.addCell(new Cell().add(new Paragraph(item.getName())));
                table.addCell(new Cell().add(new Paragraph(item.getBarcode())));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity()))));
                table.addCell(new Cell().add(new Paragraph(String.format("%.2f", item.getSellingPrice()))));
                table.addCell(new Cell().add(new Paragraph(String.format("%.2f", totalItemPrice))));
            }

            document.add(table);

            // --- FOOTER & TOTALS ---
            document.add(new Paragraph("\n"));

            // Totals Table (Right Aligned)
            Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{4, 1})).useAllAvailableWidth();

            addTotalRow(totalsTable, "Grand Total:", data.getTotalAmount(), true);
            addTotalRow(totalsTable, "Amount Paid:", data.getTotalAmount(), false); // Assuming full payment
            addTotalRow(totalsTable, "Change:", 0.00, false);

            document.add(totalsTable);

            // --- CLOSING ---
            document.add(new Paragraph("\nThank you for your business! | Generated on: " + data.getInvoiceDate())
                    .setTextAlignment(TextAlignment.CENTER).setFontSize(10));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }


    private void addTotalRow(Table table, String label, double amount, boolean isBold) {
        Paragraph labelPara = new Paragraph(label).setTextAlignment(TextAlignment.RIGHT);
        Paragraph amountPara = new Paragraph(String.format("%.2f", amount)).setTextAlignment(TextAlignment.RIGHT);

        if (isBold) {
            labelPara.setBold();
            amountPara.setBold();
        }

        table.addCell(new Cell().add(labelPara).setBorder(Border.NO_BORDER));
        table.addCell(new Cell().add(amountPara).setBorder(Border.NO_BORDER));
    }
}//@Transactional(readOnly = true)
//@Transactional(rollbackFor = Exception.class)