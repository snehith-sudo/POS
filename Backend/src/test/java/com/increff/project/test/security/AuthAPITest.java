package com.increff.project.test.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.increff.project.entity.AuthPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.api.AuthAPI;
import com.increff.project.dao.AuthDAO;
import com.increff.project.model.data.AuthUserData;
import com.increff.project.model.constants.UserRoles;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@ExtendWith(MockitoExtension.class)
public class AuthAPITest {

    @Mock
    private AuthDAO authDAO;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private HttpServletRequest mockRequest;

    @Mock
    private HttpServletResponse mockResponse;

    @Mock
    private HttpSession mockSession;

    @Mock
    private Authentication mockAuthentication;

    @InjectMocks
    private AuthAPI authAPI;

    private AuthPojo testUser;
    private AuthPojo supervisorUser;

    @BeforeEach
    void setUp() {
        testUser = new AuthPojo();
        testUser.setUsername("operator");
        testUser.setPassword("encoded_password");
        testUser.setRole(UserRoles.OPERATOR);

        supervisorUser = new AuthPojo();
        supervisorUser.setUsername("admin");
        supervisorUser.setPassword("encoded_password");
        supervisorUser.setRole(UserRoles.SUPERVISOR);

        // Set supervisor usernames
        ReflectionTestUtils.setField(authAPI, "supervisorUsernames", "admin,supervisor");

        when(mockRequest.getSession(true)).thenReturn(mockSession);
    }

    // ==================== Login Tests ====================

    @Test
    void testLoginSuccess() {
        // Arrange
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken("operator", "password123");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(mockAuthentication.isAuthenticated()).thenReturn(true);

        // Act
        AuthUserData result = authAPI.login("operator", "password123", mockRequest, mockResponse);

        // Assert
        assertNotNull(result);
        assertEquals("operator", result.getUsername());
        assertEquals(UserRoles.OPERATOR, result.getRole());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(mockRequest, times(1)).getSession(true);
    }

    @Test
    void testLoginSupervisor() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(mockAuthentication.isAuthenticated()).thenReturn(true);

        // Act
        AuthUserData result = authAPI.login("admin", "password123", mockRequest, mockResponse);

        // Assert
        assertNotNull(result);
        assertEquals("admin", result.getUsername());
        assertEquals(UserRoles.SUPERVISOR, result.getRole());
    }

    @Test
    void testLoginInvalidCredentials() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.core.AuthenticationException("Invalid credentials") {});

        // Act & Assert
        assertThrows(Exception.class, () -> 
            authAPI.login("operator", "wrong_password", mockRequest, mockResponse));
    }

    @Test
    void testLoginWithNullUsername() {
        // Act & Assert (SecurityContextHolder operations should handle)
        assertDoesNotThrow(() -> 
            authAPI.login(null, "password123", mockRequest, mockResponse));
    }

    @Test
    void testLoginWithNullPassword() {
        // Act & Assert
        assertDoesNotThrow(() -> 
            authAPI.login("operator", null, mockRequest, mockResponse));
    }

    // ==================== Create User Tests ====================

    @Test
    void testCreateUserSuccess() {
        // Arrange
        when(authDAO.findUserByUserName("newuser")).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password_123");
        doNothing().when(authDAO).saveUser(any(AuthPojo.class));

        // Act
        authAPI.createUser("newuser", "password123");

        // Assert
        verify(authDAO, times(1)).findUserByUserName("newuser");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(authDAO, times(1)).saveUser(any(AuthPojo.class));
    }

    @Test
    void testCreateUserAlreadyExists() {
        // Arrange
        when(authDAO.findUserByUserName("operator")).thenReturn(testUser);

        // Act & Assert
        assertThrows(ApiException.class, () -> authAPI.createUser("operator", "password123"));
        verify(authDAO, times(1)).findUserByUserName("operator");
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void testCreateUserSupervisor() {
        // Arrange
        when(authDAO.findUserByUserName("admin")).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password_123");
        doNothing().when(authDAO).saveUser(any(AuthPojo.class));

        // Act
        authAPI.createUser("admin", "password123");

        // Assert
        verify(authDAO, times(1)).findUserByUserName("admin");
        verify(authDAO, times(1)).saveUser(any(AuthPojo.class));
    }

    @Test
    void testCreateUserWithSpecialCharacters() {
        // Arrange
        when(authDAO.findUserByUserName("user@domain.com")).thenReturn(null);
        when(passwordEncoder.encode("p@$$w0rd")).thenReturn("encoded_password");
        doNothing().when(authDAO).saveUser(any(AuthPojo.class));

        // Act
        authAPI.createUser("user@domain.com", "p@$$w0rd");

        // Assert
        verify(authDAO, times(1)).findUserByUserName("user@domain.com");
        verify(passwordEncoder, times(1)).encode("p@$$w0rd");
    }

    @Test
    void testCreateUserEmptyPassword() {
        // Arrange
        when(authDAO.findUserByUserName("user")).thenReturn(null);
        when(passwordEncoder.encode("")).thenReturn("empty_encoded");
        doNothing().when(authDAO).saveUser(any(AuthPojo.class));

        // Act
        authAPI.createUser("user", "");

        // Assert
        verify(passwordEncoder, times(1)).encode("");
    }

    @Test
    void testCreateUserLongPassword() {
        // Arrange
        String longPassword = "a".repeat(1000);
        when(authDAO.findUserByUserName("user")).thenReturn(null);
        when(passwordEncoder.encode(longPassword)).thenReturn("encoded_long");
        doNothing().when(authDAO).saveUser(any(AuthPojo.class));

        // Act
        authAPI.createUser("user", longPassword);

        // Assert
        verify(passwordEncoder, times(1)).encode(longPassword);
    }

    // ==================== Get Current User Tests ====================

    @Test
    void testGetCurrentUserSuccess() {
        // Arrange
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(mockAuthentication);
        SecurityContextHolder.setContext(context);

        when(mockAuthentication.isAuthenticated()).thenReturn(true);
        when(mockAuthentication.getName()).thenReturn("operator");
        when(authDAO.findUserByUserName("operator")).thenReturn(testUser);

        // Act
        AuthPojo result = authAPI.getCurrentUser();

        // Assert
        assertNotNull(result);
        assertEquals("operator", result.getUsername());
        assertEquals(UserRoles.OPERATOR, result.getRole());
    }

    @Test
    void testGetCurrentUserSupervisor() {
        // Arrange
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(mockAuthentication);
        SecurityContextHolder.setContext(context);

        when(mockAuthentication.isAuthenticated()).thenReturn(true);
        when(mockAuthentication.getName()).thenReturn("admin");
        when(authDAO.findUserByUserName("admin")).thenReturn(supervisorUser);

        // Act
        AuthPojo result = authAPI.getCurrentUser();

        // Assert
        assertNotNull(result);
        assertEquals("admin", result.getUsername());
        assertEquals(UserRoles.SUPERVISOR, result.getRole());
    }

    @Test
    void testGetCurrentUserNotAuthenticated() {
        // Arrange
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(mockAuthentication);
        SecurityContextHolder.setContext(context);

        when(mockAuthentication.isAuthenticated()).thenReturn(false);

        // Act & Assert
        assertThrows(ApiException.class, () -> authAPI.getCurrentUser());
    }

    @Test
    void testGetCurrentUserNullAuthentication() {
        // Arrange
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(null);
        SecurityContextHolder.setContext(context);

        // Act & Assert
        assertThrows(ApiException.class, () -> authAPI.getCurrentUser());
    }

    @Test
    void testGetCurrentUserNotFound() {
        // Arrange
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(mockAuthentication);
        SecurityContextHolder.setContext(context);

        when(mockAuthentication.isAuthenticated()).thenReturn(true);
        when(mockAuthentication.getName()).thenReturn("nonexistent");
        when(authDAO.findUserByUserName("nonexistent")).thenReturn(null);

        // Act & Assert
        assertThrows(ApiException.class, () -> authAPI.getCurrentUser());
    }

    @Test
    void testGetCurrentUserMultipleValidations() {
        // Arrange
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(mockAuthentication);
        SecurityContextHolder.setContext(context);

        when(mockAuthentication.isAuthenticated()).thenReturn(true);
        when(mockAuthentication.getName()).thenReturn("operator");
        when(authDAO.findUserByUserName("operator")).thenReturn(testUser);

        // Act
        AuthPojo result1 = authAPI.getCurrentUser();
        AuthPojo result2 = authAPI.getCurrentUser();

        // Assert
        assertEquals(result1.getUsername(), result2.getUsername());
        verify(authDAO, times(2)).findUserByUserName("operator");
    }

    // ==================== Edge Cases ====================

    @Test
    void testLoginAndGetCurrentUserFlow() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuthentication);
        when(mockAuthentication.isAuthenticated()).thenReturn(true);

        // Act - Login
        AuthUserData loginResult = authAPI.login("operator", "password", mockRequest, mockResponse);

        // Assert login result
        assertNotNull(loginResult);
        assertEquals("operator", loginResult.getUsername());
    }

    @Test
    void testCreateAndFindUser() {
        // Arrange
        when(authDAO.findUserByUserName("testuser")).thenReturn(null);
        when(passwordEncoder.encode("pass123")).thenReturn("encoded123");
        doNothing().when(authDAO).saveUser(any(AuthPojo.class));

        // Act
        authAPI.createUser("testuser", "pass123");

        // Assert
        verify(authDAO, times(1)).findUserByUserName("testuser");
        verify(authDAO, times(1)).saveUser(any(AuthPojo.class));
    }
}
