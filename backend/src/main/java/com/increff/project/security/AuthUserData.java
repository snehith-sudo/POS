package com.increff.project.security;

import lombok.Data;

@Data
public class AuthUserData {
    private String username;
    private UserRoles role;
}
