package com.increff.project.model.form;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.time.ZonedDateTime;

@Data
public class SalesReportDatesForm {
    @NotNull
    private ZonedDateTime startDate;

    @NotNull
    private ZonedDateTime endDate;
}
