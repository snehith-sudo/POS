package com.increff.project.model.data;

import com.increff.project.model.constants.UserRoles;
import lombok.Data;

@Data
public class AuthUserData {
    private String username;
    private UserRoles role;
}
