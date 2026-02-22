package com.increff.project.test.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.increff.project.model.data.AuthUserData;
import com.increff.project.model.constants.UserRoles;

public class AuthUserDataTest {

    private AuthUserData authUserData;

    @BeforeEach
    void setUp() {
        authUserData = new AuthUserData();
    }

    @Test
    void testSetAndGetUsername() {
        // Arrange
        String username = "testuser";

        // Act
        authUserData.setUsername(username);
        String result = authUserData.getUsername();

        // Assert
        assertEquals(username, result);
    }

    @Test
    void testSetAndGetRole() {
        // Arrange
        UserRoles role = UserRoles.SUPERVISOR;

        // Act
        authUserData.setRole(role);
        UserRoles result = authUserData.getRole();

        // Assert
        assertEquals(role, result);
    }

    @Test
    void testUsernameNull() {
        // Act
        authUserData.setUsername(null);

        // Assert
        assertNull(authUserData.getUsername());
    }

    @Test
    void testRoleNull() {
        // Act
        authUserData.setRole(null);

        // Assert
        assertNull(authUserData.getRole());
    }

    @Test
    void testUsernameEmpty() {
        // Arrange
        String username = "";

        // Act
        authUserData.setUsername(username);

        // Assert
        assertEquals("", authUserData.getUsername());
    }

    @Test
    void testUsernameWithSpecialCharacters() {
        // Arrange
        String username = "test@user.123";

        // Act
        authUserData.setUsername(username);

        // Assert
        assertEquals(username, authUserData.getUsername());
    }

    @Test
    void testSupervisorRole() {
        // Act
        authUserData.setRole(UserRoles.SUPERVISOR);

        // Assert
        assertEquals(UserRoles.SUPERVISOR, authUserData.getRole());
    }

    @Test
    void testOperatorRole() {
        // Act
        authUserData.setRole(UserRoles.OPERATOR);

        // Assert
        assertEquals(UserRoles.OPERATOR, authUserData.getRole());
    }

    @Test
    void testMultipleSetOperations() {
        // Arrange & Act
        authUserData.setUsername("user1");
        authUserData.setRole(UserRoles.SUPERVISOR);
        authUserData.setUsername("user2");
        authUserData.setRole(UserRoles.OPERATOR);

        // Assert
        assertEquals("user2", authUserData.getUsername());
        assertEquals(UserRoles.OPERATOR, authUserData.getRole());
    }

    @Test
    void testDataIntegrity() {
        // Arrange
        String username = "john_doe";
        UserRoles role = UserRoles.SUPERVISOR;

        // Act
        authUserData.setUsername(username);
        authUserData.setRole(role);

        // Assert
        assertNotNull(authUserData.getUsername());
        assertNotNull(authUserData.getRole());
        assertEquals(username, authUserData.getUsername());
        assertEquals(role, authUserData.getRole());
    }

    @Test
    void testLongUsername() {
        // Arrange
        String longUsername = "a".repeat(100);

        // Act
        authUserData.setUsername(longUsername);

        // Assert
        assertEquals(longUsername, authUserData.getUsername());
    }
}
