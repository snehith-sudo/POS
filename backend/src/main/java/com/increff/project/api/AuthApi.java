//package com.increff.project.api;
//
//import com.increff.project.model.form.SuperVisoForm;
//import com.increff.project.model.form.UserForm;
//import com.increff.project.dao.UserDao;
//import org.springframework.security.core.userdetails.*;
//        import org.springframework.stereotype.Service;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//@Service
//public class AuthApi implements UserDetailsService {
//
//    private final SuperVisoForm supervisorConfig;
//    private final UserDao userDao;
//    private final PasswordEncoder encoder;
//
//    public void AuthUserDetailsService(SuperVisoForm supervisorConfig, UserDao userDao, PasswordEncoder encoder) {
//        this.supervisorConfig = supervisorConfig;
//        this.userDao = userDao;
//        this.encoder = encoder;
//    }
//
//    @Override
//    public UserDetails loadUserByUsername(String username) {
//
//        // 1. Supervisor
//        if (username.equals(supervisorConfig.getUsername())) {
//            return User.builder()
//                    .username(supervisorConfig.getUsername())
//                    .password(encoder.encode(supervisorConfig.getPassword()))
//                    .roles(Roles.SUPERVISOR)
//                    .build();
//        }
//
//        // 2. Operator from DB
//        UserForm user = userDao.findByUsername(username);
//
//        if (user == null || "INACTIVE".equals(user.getStatus())) throw new UsernameNotFoundException("Username not found or user access revoked");
//
//        return User.builder()
//                .username(user.ge())
//                .password(user.getPassword())
//                .roles(Roles.OPERATOR)
//                .build();
//    }
//}