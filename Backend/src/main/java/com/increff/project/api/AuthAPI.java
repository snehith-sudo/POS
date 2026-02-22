package com.increff.project.api;

import com.increff.project.entity.AuthPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.dao.AuthDAO;
import com.increff.project.model.data.AuthUserData;
import com.increff.project.model.constants.UserRoles;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Objects;

@Transactional
@Service
public class AuthAPI {

    @Autowired
    private AuthDAO authDAO;

    @Value("${supervisor.usernames}")
    private String supervisorUsernames;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthUserData login(
            String username,
            String password,
            HttpServletRequest request,
            HttpServletResponse response) {

        // 1️⃣ Create authentication request (unauthenticated)
        UsernamePasswordAuthenticationToken authRequest =
                new UsernamePasswordAuthenticationToken(username, password);

        // 2️⃣ Authenticate (THIS triggers UserDetailsService + bcrypt check)
        Authentication authentication =
                authenticationManager.authenticate(authRequest);

        // 3️⃣ Create fresh SecurityContext
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);

        // 4️⃣ Save context (this ALSO creates session + JSESSIONID)
        HttpSessionSecurityContextRepository repo =
                new HttpSessionSecurityContextRepository();
        repo.saveContext(context, request, response);

        // 5️⃣ Build response DTO
        AuthUserData data = new AuthUserData();
        data.setUsername(username);
        data.setRole(decideRole(username));

        return data;
    }



    public void createUser(String username, String rawPassword)
    {

        AuthPojo existing = authDAO.findUserByUserName(username);
        if (!Objects.isNull(existing)) {
            throw new ApiException("Username already exists: " + username);
        }

        // 2. Decide role
        UserRoles role = decideRole(username);

        // 3. Encode password
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // 4. Create pojo
        AuthPojo pojo = new AuthPojo();
        pojo.setUsername(username);
        pojo.setPassword(encodedPassword);
        pojo.setRole(role);

        authDAO.saveUser(pojo);
    }

    private UserRoles decideRole(String username) {
        if (Arrays.asList(supervisorUsernames.split(",")).contains(username)) {
            return UserRoles.SUPERVISOR;
        }
        return UserRoles.OPERATOR;
    }

    public AuthPojo getCurrentUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new ApiException("User not authenticated");
        }

        String username = auth.getName();

        AuthPojo user = authDAO.findUserByUserName(username);
        if (user == null) {
            throw new ApiException("Authenticated user not found");
        }

        return user;
    }

}
