package com.increff.project.scheduler;

import com.increff.project.useCase.SalesReportFlow;
import com.increff.project.entity.SalesReportPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class ScheduleReport {

    @Autowired
    private SalesReportFlow salesReportFlow;

    @Scheduled(cron = "0 45 13 * * *")  // Runs every day at 11:59 PM
    public void run() {
        ZonedDateTime end = ZonedDateTime.now();
        ZonedDateTime start = end.minusHours(24);

        salesReportFlow.saveDaySalesReport(start, end);
    }
}
