package com.increff.project.utils.utils;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.LocalDateTime;

@Converter(autoApply = true)
public class ZonedDateTimeConverter implements AttributeConverter<ZonedDateTime, LocalDateTime> {

    @Override
    public LocalDateTime convertToDatabaseColumn(ZonedDateTime attribute) {
        return attribute == null ? null : attribute.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
    }

    @Override
    public ZonedDateTime convertToEntityAttribute(LocalDateTime dbData) {
        return dbData == null ? null : dbData.atZone(ZoneId.systemDefault());
    }
}

