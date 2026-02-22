package com.increff.project.entity;

import jakarta.persistence.*;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name="Client",uniqueConstraints = @UniqueConstraint(name="uk_client_clientName",
        columnNames = {"name"}))
public class ClientPojo extends BasePojo {

    @Column(nullable = false,unique = true)
    private String name;
}