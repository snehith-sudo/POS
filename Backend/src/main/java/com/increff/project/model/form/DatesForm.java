package com.increff.project.model.form;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class DatesForm {
    @NotNull
    private ZonedDateTime startDate;

    @NotNull
    private ZonedDateTime endDate;

    @NotNull
    private Integer page;

    @NotNull
    private Integer size;
}
