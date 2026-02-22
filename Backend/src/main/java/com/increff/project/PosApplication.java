package com.increff.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableJpaAuditing(dateTimeProviderRef = "dateTimeProvider")
public class PosApplication {

	public static void main(String[] args) {
		System.out.println("started");
		SpringApplication.run(PosApplication.class, args);
	}
}

