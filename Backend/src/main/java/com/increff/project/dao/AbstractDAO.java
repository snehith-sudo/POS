package com.increff.project.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

public abstract class AbstractDAO<T> {

    @PersistenceContext
    protected EntityManager em;

    private final Class<T> entityClass;

    protected AbstractDAO(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    protected void addNewEntity(T entity) {
        em.persist(entity);
    }

    protected T getEntityById(Integer id) {
        return em.find(entityClass, id);
    }

    protected List<T> selectExistingEntityWithIds(List<Long> ids) {

        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        String jpql = "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e.id IN :ids";

        return em.createQuery(jpql, entityClass)
                .setParameter("ids", ids)
                .getResultList();
    }

    protected void update(T entity){
        em.merge(entity);
    }

    protected List<T> selectPaged(int offset, int limit, String orderBy) {

        String jpql = "SELECT e FROM " + entityClass.getSimpleName() + " e ORDER BY e." + orderBy + " ASC";

        return em.createQuery(jpql, entityClass)
                .setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }

    protected long countAllRowsInTable() {

        String q = "SELECT COUNT(e) FROM " + entityClass.getSimpleName() + " e";
        return em.createQuery(q, Long.class).getSingleResult();
    }

}
