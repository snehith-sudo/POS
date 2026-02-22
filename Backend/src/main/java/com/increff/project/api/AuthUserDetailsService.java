package com.increff.project.api;

import com.increff.project.dao.AuthDAO;
import com.increff.project.entity.AuthPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthUserDetailsService implements UserDetailsService {

    private final AuthDAO authDAO;

    public AuthUserDetailsService(AuthDAO authDAO) {
        this.authDAO = authDAO;
    }
    @Autowired
    PasswordEncoder encoder;

    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {


        AuthPojo user = authDAO.findUserByUserName(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword()) // already encoded
                .roles(user.getRole().name()) // SUPERVISOR / OPERATOR
                .build();
    }
}
