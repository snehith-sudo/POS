package com.increff.project.dao;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;
import java.util.List;

public abstract class AbstractDAO<T> {

    @PersistenceContext
    protected EntityManager em;

    private final Class<T> entityClass;

    protected AbstractDAO(Class<T> entityClass) {
        this.entityClass = entityClass;
    }

    protected void insert(T entity) {
        em.persist(entity);
    }

    protected List<T> findByClientId(int clientId) {

        return em.createQuery(
                        "SELECT e FROM " + entityClass.getSimpleName() +
                                " e WHERE e.clientId = :clientId",
                        entityClass
                )
                .setParameter("clientId", clientId)
                .getResultList();
    }

    protected T findById(Integer id) {return em.find(entityClass, id);}

    protected T findByName(String name) {

        List<T> results = em.createQuery(
                        "SELECT e FROM " + entityClass.getSimpleName() + " e WHERE e.name = :name",
                        entityClass)
                .setParameter("name", name)
                .getResultList();

        return results.isEmpty() ? null : results.getFirst();
    }

    protected boolean existsByName(String name) {

        Long count = em.createQuery(
                        "SELECT COUNT(e) FROM " + entityClass.getSimpleName() + " e WHERE e.name = :name",
                        Long.class)
                .setParameter("name", name)
                .getSingleResult();

        return count > 0;
    }

    protected boolean existsById(Integer id) {return em.find(entityClass, id) != null;}

    protected List<Integer> selectmultipleExistingIds(List<Integer> ids) {

        if (ids == null || ids.isEmpty()) {return List.of();}

        String jpql = "SELECT e.id FROM " + entityClass.getSimpleName() + " e WHERE e.id IN :ids";

        return em.createQuery(jpql, Integer.class)
                .setParameter("ids", ids)
                .getResultList();
    }

    protected T findByBarcode(String barcode, Object value) {

        String jpql = "SELECT e FROM " + entityClass.getSimpleName()
                + " e WHERE e." + barcode + " = :value";

        List<T> result = em.createQuery(jpql, entityClass)
                .setParameter("value", value)
                .getResultList();

        return result.isEmpty() ? null : result.get(0);
    }

    protected boolean existsByField(String fieldName, Object value) {

        String jpql = "SELECT COUNT(e) FROM " + entityClass.getSimpleName()
                + " e WHERE e." + fieldName + " = :value";

        Long count = em.createQuery(jpql, Long.class)
                .setParameter("value", value)
                .getSingleResult();

        return count > 0;
    }


    protected void update(T entity){
        em.merge(entity);
    }

    // MUST be protected
    protected List<T> selectAll() {
        return em.createQuery("SELECT e FROM " + entityClass.getSimpleName() + " e ORDER BY e.id", entityClass)
                .getResultList();
    }

    // MUST be protected
    protected List<T> selectAllPaginated(int page, int size) {
        return em.createQuery("SELECT e FROM " + entityClass.getSimpleName() + " e ORDER BY e.id", entityClass)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    /* For Daily sales report */

}
