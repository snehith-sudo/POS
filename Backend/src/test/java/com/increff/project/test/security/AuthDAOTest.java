package com.increff.project.test.security;

import com.increff.project.dao.AuthDAO;
import com.increff.project.entity.AuthPojo;
import com.increff.project.model.constants.UserRoles;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthDAOTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private AuthDAO authDAO;

    private AuthPojo testUser;

    @BeforeEach
    void setUp() {
        testUser = new AuthPojo();
        testUser.setUsername("testuser");
        testUser.setRole(UserRoles.OPERATOR);
    }

    @Test
    void testSaveUserSuccess() {
        // Act
        authDAO.saveUser(testUser);

        // Assert
        verify(entityManager, times(1)).persist(testUser);
    }

    @Test
    void testSaveUserNull() {
        // Act
        authDAO.saveUser(null);

        // Assert
        verify(entityManager, times(1)).persist(null);
    }

    @Test
    void testSaveMultipleUsers() {
        // Arrange
        AuthPojo user2 = new AuthPojo();
        user2.setUsername("testuser2");
        user2.setRole(UserRoles.SUPERVISOR);

        // Act
        authDAO.saveUser(testUser);
        authDAO.saveUser(user2);

        // Assert
        verify(entityManager, times(2)).persist(any(AuthPojo.class));
    }

    @Test
    void testFindUserByUsernameSuccess() {
        // Arrange
        List<AuthPojo> users = new ArrayList<>();
        users.add(testUser);

        when(entityManager.createQuery(anyString(), eq(AuthPojo.class)))
                .thenReturn((TypedQuery<AuthPojo>) query);
        when(query.setParameter("username", "testuser"))
                .thenReturn(query);
        when(query.getResultList()).thenReturn(users);

        // Act
        AuthPojo result = authDAO.findUserByUserName("testuser");

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals(UserRoles.OPERATOR, result.getRole());
    }

    @Test
    void testFindUserByUsernameNotFound() {
        // Arrange
        List<AuthPojo> emptyList = new ArrayList<>();

        when(entityManager.createQuery(anyString(), eq(AuthPojo.class)))
                .thenReturn((TypedQuery<AuthPojo>) query);
        when(query.setParameter("username", "nonexistent"))
                .thenReturn(query);
        when(query.getResultList()).thenReturn(emptyList);

        // Act
        AuthPojo result = authDAO.findUserByUserName("nonexistent");

        // Assert
        assertNull(result);
    }

    @Test
    void testFindUserByUsernameMultipleResults() {
        // Arrange
        AuthPojo user2 = new AuthPojo();
        user2.setUsername("testuser");
        user2.setRole(UserRoles.SUPERVISOR);

        List<AuthPojo> users = new ArrayList<>();
        users.add(testUser);
        users.add(user2);

        when(entityManager.createQuery(anyString(), eq(AuthPojo.class)))
                .thenReturn((TypedQuery<AuthPojo>) query);
        when(query.setParameter("username", "testuser"))
                .thenReturn(query);
        when(query.getResultList()).thenReturn(users);

        // Act
        AuthPojo result = authDAO.findUserByUserName("testuser");

        // Assert
        assertNotNull(result);
        // Should return the first one
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void testFindUserByUsernameNull() {
        // Arrange
        List<AuthPojo> emptyList = new ArrayList<>();

        when(entityManager.createQuery(anyString(), eq(AuthPojo.class)))
                .thenReturn((TypedQuery<AuthPojo>) query);
        when(query.setParameter("username", null))
                .thenReturn(query);
        when(query.getResultList()).thenReturn(emptyList);

        // Act
        AuthPojo result = authDAO.findUserByUserName(null);

        // Assert
        assertNull(result);
    }

    @Test
    void testFindUserByUsernameEmpty() {
        // Arrange
        List<AuthPojo> emptyList = new ArrayList<>();

        when(entityManager.createQuery(anyString(), eq(AuthPojo.class)))
                .thenReturn((TypedQuery<AuthPojo>) query);
        when(query.setParameter("username", ""))
                .thenReturn(query);
        when(query.getResultList()).thenReturn(emptyList);

        // Act
        AuthPojo result = authDAO.findUserByUserName("");

        // Assert
        assertNull(result);
    }

    @Test
    void testFindUserByUsernameOperator() {
        // Arrange
        List<AuthPojo> users = new ArrayList<>();
        users.add(testUser);

        when(entityManager.createQuery(anyString(), eq(AuthPojo.class)))
                .thenReturn((TypedQuery<AuthPojo>) query);
        when(query.setParameter("username", "operator"))
                .thenReturn(query);
        when(query.getResultList()).thenReturn(users);

        // Act
        AuthPojo result = authDAO.findUserByUserName("operator");

        // Assert
        assertNotNull(result);
        assertEquals(UserRoles.OPERATOR, result.getRole());
    }

    @Test
    void testFindUserByUsernameSupervisor() {
        // Arrange
        testUser.setRole(UserRoles.SUPERVISOR);
        List<AuthPojo> users = new ArrayList<>();
        users.add(testUser);

        when(entityManager.createQuery(anyString(), eq(AuthPojo.class)))
                .thenReturn((TypedQuery<AuthPojo>) query);
        when(query.setParameter("username", "supervisor"))
                .thenReturn(query);
        when(query.getResultList()).thenReturn(users);

        // Act
        AuthPojo result = authDAO.findUserByUserName("supervisor");

        // Assert
        assertNotNull(result);
        assertEquals(UserRoles.SUPERVISOR, result.getRole());
    }
}
