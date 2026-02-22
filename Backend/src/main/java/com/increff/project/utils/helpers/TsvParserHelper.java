package com.increff.project.utils.helpers;

import com.increff.project.exception.ApiException;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class TsvParserHelper {

    private TsvParserHelper() {
        // utility class
    }

    public static List<String[]> parseBase64Tsv(String base64Tsv) {

        if (base64Tsv == null || base64Tsv.isBlank()) {
            throw new IllegalArgumentException("Found the TSV data empty , IllegalArgumentException");
        }

        byte[] decodedBytes = Base64.getDecoder().decode(base64Tsv);
        String content = new String(decodedBytes, StandardCharsets.UTF_8);

        String[] lines = content.split("\\R");
        List<String[]> rows = new ArrayList<>();

        String[] header = lines[0].split("\t");
        if (isBarcodeHeader(header)) {
            validateBarcodeTsv(lines);
        }
        else if (isProductsHeader(header)) {
            validateProductsTsv(lines);
        }
        else {
            throw new ApiException("Invalid TSV header. Expected either:\n" +
                    "1. barcode, quantity\n" +
                    "2. barcode, name, mrp, clientId, imageUrl");
        }

        for (int i = 1; i < lines.length; i++) {
            if (lines[i].trim().isEmpty()) continue;
            rows.add(lines[i].split("\t"));
        }

        if (rows.isEmpty()) {throw new ApiException("TSV file is empty");}

        if (rows.size() > 5000) {throw new ApiException("TSV row limit exceeded (max 5000)");}

        return rows;
    }
    private static boolean isBarcodeHeader(String[] header) {
        return header.length == 2 &&
                header[0].trim().equalsIgnoreCase("barcode") &&
                header[1].trim().equalsIgnoreCase("quantity");
    }

    private static boolean isProductsHeader(String[] header) {
        return header.length == 5 &&
                header[0].trim().equalsIgnoreCase("barcode") &&
                header[1].trim().equalsIgnoreCase("name") &&
                header[2].trim().equalsIgnoreCase("mrp") &&
                header[3].trim().equalsIgnoreCase("clientName") &&
                header[4].trim().equalsIgnoreCase("imageUrl");
    }
    private static void validateBarcodeTsv(String[] lines) {
        for (int i = 1; i < lines.length; i++) {
            String[] cols = lines[i].split("\t", -1);
            if (cols.length != 2) {
                throw new ApiException("Invalid row format at line " + (i + 1) +
                        ". Expected 2 columns: barcode, quantity");
            }
        }
    }
    private static void validateProductsTsv(String[] lines) {
        for (int i = 1; i < lines.length; i++) {
            String[] cols = lines[i].split("\t", -1);
            if (cols.length != 5) {
                throw new ApiException("Invalid row format at line " + (i + 1) +
                        ". Expected 5 columns: barcode, name, mrp, clientName, imageUrl");
            }
        }
    }

}
