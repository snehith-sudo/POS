package com.increff.project.dao;

import com.increff.project.entity.AuthPojo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AuthDAO {

    @PersistenceContext
    private EntityManager em;

    public void saveUser(AuthPojo user)
    {
        em.persist(user);
    }

    public AuthPojo findUserByUserName(String username) {
        List<AuthPojo> result = em.createQuery(
                        "SELECT a FROM AuthPojo a WHERE a.username = :username",
                        AuthPojo.class
                )
                .setParameter("username", username)
                .getResultList();

        return result.isEmpty() ? null : result.getFirst();
    }

}
