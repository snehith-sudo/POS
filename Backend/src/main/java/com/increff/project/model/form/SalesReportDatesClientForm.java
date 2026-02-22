package com.increff.project.model.form;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.time.ZonedDateTime;

@Data
public class SalesReportDatesClientForm {

    @NotNull
    private String clientName;

    @NotNull
    private ZonedDateTime startDate;

    @NotNull
    private ZonedDateTime endDate;

    @NotNull
    private Integer page;

    @NotNull
    private Integer size;
}
