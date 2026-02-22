package com.increff.project.scheduler;

import com.increff.project.useCase.SalesReportUseCase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;

@Component
public class ScheduleReport {

    @Autowired
    private SalesReportUseCase salesReportUseCase;

    @Scheduled(cron = "0 29 18 * * *", zone = "UTC")
    public void run() {
        ZonedDateTime end = ZonedDateTime.now();
        ZonedDateTime start = end.minusHours(24);

        salesReportUseCase.saveDaySalesReport(start, end);
    }
}
