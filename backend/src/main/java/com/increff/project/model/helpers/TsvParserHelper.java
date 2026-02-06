package com.increff.project.model.helpers;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class TsvParserHelper {

    private TsvParserHelper() {
        // utility class
    } //TODO why constructor

    public static List<String[]> parseBase64Tsv(String base64Tsv) {

        if (base64Tsv == null || base64Tsv.isBlank()) {
            throw new IllegalArgumentException("Found the TSV data empty , IllegalArgumentException");
        }

        byte[] decodedBytes = Base64.getDecoder().decode(base64Tsv);
        String content = new String(decodedBytes, StandardCharsets.UTF_8);

        String[] lines = content.split("\\R");
        List<String[]> rows = new ArrayList<>();

        // Skip header (index 0)
        for (int i = 1; i < lines.length; i++) {
            if (lines[i].trim().isEmpty()) continue;
            rows.add(lines[i].split("\t"));
        }

        return rows;
    }
}
