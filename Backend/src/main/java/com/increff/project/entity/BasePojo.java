package com.increff.project.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.ZonedDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Data
public abstract class BasePojo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @LastModifiedDate
    private ZonedDateTime updatedAt;

    @Version
    private Long version;

    //TODO versioning & read annotations
}
