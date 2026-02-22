package com.increff.project.entity;

import com.increff.project.model.constants.UserRoles;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "users",uniqueConstraints = @UniqueConstraint(name="uk_user_username",
        columnNames = {"username"}))
public class AuthPojo extends BasePojo {

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRoles role;

    @Column(nullable = false)
    private boolean active = true;
}
