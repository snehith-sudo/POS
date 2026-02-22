package com.increff.project.dto;

import com.increff.project.api.AuthAPI;
import com.increff.project.entity.AuthPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.model.form.AuthForm;
import com.increff.project.model.data.AuthUserData;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AuthDTO{

    @Autowired
    private AuthAPI authAPI;

    public void signup(AuthForm request) {

        if (request.getUsername() == null || request.getPassword() == null) {
            throw new ApiException("Username and password required");
        }

        authAPI.createUser(request.getUsername(), request.getPassword());
    }
    public AuthUserData login(AuthForm request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) throws ApiException {

        String username = request.getUsername().trim().toLowerCase();
        String password = request.getPassword();

        return authAPI.login(username,password,httpRequest,httpResponse);
    }

    public AuthUserData me() {

        AuthPojo user = authAPI.getCurrentUser();

        System.out.println("role is "+ user.getRole());
        System.out.println("Username is "+user.getUsername());

        AuthUserData data = new AuthUserData();
        data.setRole(user.getRole());
        data.setUsername(user.getUsername());

        System.out.println(data.getUsername()+"  "+data.getRole());
        return data;
    }

}

