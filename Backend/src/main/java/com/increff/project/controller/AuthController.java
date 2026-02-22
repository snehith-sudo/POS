package com.increff.project.controller;

import com.increff.project.dto.AuthDTO;
import com.increff.project.model.form.AuthForm;
import com.increff.project.model.data.AuthUserData;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthDTO authDto;

    @RequestMapping(method = RequestMethod.POST,path = "/signup")
    public void signup(@RequestBody AuthForm request) {
        authDto.signup(request);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/login")
    public AuthUserData login(@RequestBody AuthForm request, HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) {
       return authDto.login(request,httpServletRequest,httpServletResponse);
    }

    @RequestMapping(method = RequestMethod.GET,path = "/me")
    public AuthUserData me() {
        return authDto.me();
    }
}

