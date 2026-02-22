package com.increff.project.test.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.increff.project.entity.AuthPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.api.AuthAPI;
import com.increff.project.dto.AuthDTO;
import com.increff.project.model.form.AuthForm;
import com.increff.project.model.data.AuthUserData;
import com.increff.project.model.constants.UserRoles;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
public class AuthDTOTest {

    @Mock
    private AuthAPI authAPI;

    @InjectMocks
    private AuthDTO authDTO;

    @Mock
    private HttpServletRequest mockRequest;

    @Mock
    private HttpServletResponse mockResponse;

    private AuthForm authForm;
    private AuthUserData authUserData;
    private AuthPojo authPojo;

    @BeforeEach
    void setUp() {
        authForm = new AuthForm();
        authForm.setUsername("testuser");
        authForm.setPassword("password123");

        authUserData = new AuthUserData();
        authUserData.setUsername("testuser");
        authUserData.setRole(UserRoles.OPERATOR);

        authPojo = new AuthPojo();
        authPojo.setUsername("testuser");
        authPojo.setRole(UserRoles.OPERATOR);
    }

    @Test
    void testSignupSuccess() {
        // Arrange
        doNothing().when(authAPI).createUser("testuser", "password123");

        // Act
        authDTO.signup(authForm);

        // Assert
        verify(authAPI, times(1)).createUser("testuser", "password123");
    }

    @Test
    void testSignupNullUsername() {
        // Arrange
        authForm.setUsername(null);

        // Act & Assert
        assertThrows(ApiException.class, () -> authDTO.signup(authForm));
        verify(authAPI, never()).createUser(anyString(), anyString());
    }

    @Test
    void testSignupNullPassword() {
        // Arrange
        authForm.setPassword(null);

        // Act & Assert
        assertThrows(ApiException.class, () -> authDTO.signup(authForm));
        verify(authAPI, never()).createUser(anyString(), anyString());
    }

    @Test
    void testSignupBothNull() {
        // Arrange
        authForm.setUsername(null);
        authForm.setPassword(null);

        // Act & Assert
        assertThrows(ApiException.class, () -> authDTO.signup(authForm));
    }

    @Test
    void testLoginSuccess() throws ApiException {
        // Arrange
        when(authAPI.login("testuser", "password123", mockRequest, mockResponse))
                .thenReturn(authUserData);

        // Act
        AuthUserData result = authDTO.login(authForm, mockRequest, mockResponse);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals(UserRoles.OPERATOR, result.getRole());
        verify(authAPI, times(1)).login("testuser", "password123", mockRequest, mockResponse);
    }

    @Test
    void testLoginWithSpaces() throws ApiException {
        // Arrange
        authForm.setUsername("  testuser  ");
        when(authAPI.login("testuser", "password123", mockRequest, mockResponse))
                .thenReturn(authUserData);

        // Act
        AuthUserData result = authDTO.login(authForm, mockRequest, mockResponse);

        // Assert
        assertNotNull(result);
        verify(authAPI, times(1)).login("testuser", "password123", mockRequest, mockResponse);
    }

    @Test
    void testLoginWithUppercase() throws ApiException {
        // Arrange
        authForm.setUsername("TESTUSER");
        when(authAPI.login("testuser", "password123", mockRequest, mockResponse))
                .thenReturn(authUserData);

        // Act
        AuthUserData result = authDTO.login(authForm, mockRequest, mockResponse);

        // Assert
        assertNotNull(result);
        verify(authAPI, times(1)).login("testuser", "password123", mockRequest, mockResponse);
    }

    @Test
    void testMeSuccess() {
        // Arrange
        when(authAPI.getCurrentUser()).thenReturn(authPojo);

        // Act
        AuthUserData result = authDTO.me();

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals(UserRoles.OPERATOR, result.getRole());
        verify(authAPI, times(1)).getCurrentUser();
    }

    @Test
    void testMeWithSupervisor() {
        // Arrange
        authPojo.setRole(UserRoles.SUPERVISOR);
        when(authAPI.getCurrentUser()).thenReturn(authPojo);

        // Act
        AuthUserData result = authDTO.me();

        // Assert
        assertNotNull(result);
        assertEquals(UserRoles.SUPERVISOR, result.getRole());
    }

    @Test
    void testMeNull() {
        // Arrange
        when(authAPI.getCurrentUser()).thenReturn(null);

        // Act & Assert
        assertThrows(NullPointerException.class, () -> authDTO.me());
    }
}
