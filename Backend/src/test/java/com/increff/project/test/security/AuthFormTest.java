package com.increff.project.test.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.increff.project.model.form.AuthForm;

public class AuthFormTest {

    private AuthForm authForm;

    @BeforeEach
    void setUp() {
        authForm = new AuthForm();
    }

    @Test
    void testSetAndGetUsername() {
        // Arrange
        String username = "testuser";

        // Act
        authForm.setUsername(username);
        String result = authForm.getUsername();

        // Assert
        assertEquals(username, result);
    }

    @Test
    void testSetAndGetPassword() {
        // Arrange
        String password = "password123";

        // Act
        authForm.setPassword(password);
        String result = authForm.getPassword();

        // Assert
        assertEquals(password, result);
    }

    @Test
    void testUsernameNull() {
        // Act
        authForm.setUsername(null);

        // Assert
        assertNull(authForm.getUsername());
    }

    @Test
    void testPasswordNull() {
        // Act
        authForm.setPassword(null);

        // Assert
        assertNull(authForm.getPassword());
    }

    @Test
    void testBothFieldsSet() {
        // Arrange
        String username = "john_doe";
        String password = "secure_pass@123";

        // Act
        authForm.setUsername(username);
        authForm.setPassword(password);

        // Assert
        assertEquals(username, authForm.getUsername());
        assertEquals(password, authForm.getPassword());
    }

    @Test
    void testUsernameEmpty() {
        // Act
        authForm.setUsername("");

        // Assert
        assertEquals("", authForm.getUsername());
    }

    @Test
    void testPasswordEmpty() {
        // Act
        authForm.setPassword("");

        // Assert
        assertEquals("", authForm.getPassword());
    }

    @Test
    void testUsernameWithSpaces() {
        // Arrange
        String username = "  user  ";

        // Act
        authForm.setUsername(username);

        // Assert
        assertEquals(username, authForm.getUsername());
    }

    @Test
    void testPasswordWithSpecialCharacters() {
        // Arrange
        String password = "p@$$w0rd!#%&*";

        // Act
        authForm.setPassword(password);

        // Assert
        assertEquals(password, authForm.getPassword());
    }

    @Test
    void testUsernameUpdate() {
        // Arrange
        authForm.setUsername("user1");

        // Act
        authForm.setUsername("user2");

        // Assert
        assertEquals("user2", authForm.getUsername());
    }

    @Test
    void testPasswordUpdate() {
        // Arrange
        authForm.setPassword("oldpass");

        // Act
        authForm.setPassword("newpass");

        // Assert
        assertEquals("newpass", authForm.getPassword());
    }

    @Test
    void testLongUsername() {
        // Arrange
        String longUsername = "a".repeat(200);

        // Act
        authForm.setUsername(longUsername);

        // Assert
        assertEquals(longUsername, authForm.getUsername());
    }

    @Test
    void testLongPassword() {
        // Arrange
        String longPassword = "p".repeat(500);

        // Act
        authForm.setPassword(longPassword);

        // Assert
        assertEquals(longPassword, authForm.getPassword());
    }
}
