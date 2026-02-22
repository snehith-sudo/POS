package com.increff.project.test.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

import com.increff.project.model.constants.UserRoles;

public class UserRolesTest {

    @Test
    void testSupervisorRoleExists() {
        // Act & Assert
        assertNotNull(UserRoles.SUPERVISOR);
        assertEquals("SUPERVISOR", UserRoles.SUPERVISOR.name());
    }

    @Test
    void testOperatorRoleExists() {
        // Act & Assert
        assertNotNull(UserRoles.OPERATOR);
        assertEquals("OPERATOR", UserRoles.OPERATOR.name());
    }

    @Test
    void testRoleValues() {
        // Act & Assert
        UserRoles[] roles = UserRoles.values();
        assertEquals(2, roles.length);
    }

    @Test
    void testRoleValueOf() {
        // Act & Assert
        assertEquals(UserRoles.SUPERVISOR, UserRoles.valueOf("SUPERVISOR"));
        assertEquals(UserRoles.OPERATOR, UserRoles.valueOf("OPERATOR"));
    }

    @Test
    void testOperatorNotEqualToSupervisor() {
        // Act & Assert
        assertNotEquals(UserRoles.SUPERVISOR, UserRoles.OPERATOR);
    }

    @Test
    void testRoleComparison() {
        // Act & Assert
        assertTrue(UserRoles.SUPERVISOR.equals(UserRoles.SUPERVISOR));
        assertFalse(UserRoles.SUPERVISOR.equals(UserRoles.OPERATOR));
    }

    @Test
    void testInvalidRoleValueOf() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> 
            UserRoles.valueOf("INVALID"));
    }

    @Test
    void testEnumOrdinal() {
        // Act & Assert
        assertEquals(0, UserRoles.SUPERVISOR.ordinal());
        assertEquals(1, UserRoles.OPERATOR.ordinal());
    }
}
