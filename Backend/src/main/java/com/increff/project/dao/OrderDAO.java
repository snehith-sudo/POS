package com.increff.project.dao;

import com.increff.project.entity.OrderPojo;
import com.increff.project.model.constants.OrderStatus;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public class OrderDAO extends AbstractDAO<OrderPojo> {

    // ---------- JPQL QUERIES ----------
    private static final String FIND_BETWEEN_DATES =
            "SELECT e FROM OrderPojo e WHERE e.orderTime BETWEEN :startDate AND :endDate";

    private static final String COUNT_BETWEEN_DATES =
            "SELECT COUNT(e) FROM OrderPojo e WHERE e.orderTime BETWEEN :startDate AND :endDate";

    private static final String FIND_BY_STATUS =
            "SELECT e FROM OrderPojo e WHERE e.status = :status";

    private static final String COUNT_BY_STATUS =
            "SELECT COUNT(e) FROM OrderPojo e WHERE e.status = :status";
    // ----------------------------------

    public OrderDAO(){
        super(OrderPojo.class);
    }

    public void createNewOrder(OrderPojo order){
        addNewEntity(order);
    }

    public void updateOrder(OrderPojo order){
        update(order);
    }

    public OrderPojo getOrderById(int id){
        return getEntityById(id);
    }

    public List<OrderPojo> findOrdersBetweenDates(ZonedDateTime startDate,
                                                  ZonedDateTime endDate,
                                                  int page,
                                                  int size){

        return em.createQuery(FIND_BETWEEN_DATES, OrderPojo.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    public long getTotalCountOfOrdersBetweenDates(ZonedDateTime startDate,
                                                  ZonedDateTime endDate){

        return em.createQuery(COUNT_BETWEEN_DATES, Long.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getSingleResult();
    }

    public List<OrderPojo> getOrderByStatus(OrderStatus status,
                                            int page,
                                            int size){

        return em.createQuery(FIND_BY_STATUS, OrderPojo.class)
                .setParameter("status", status)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    public long getTotalCountOfOrderByOrderStatus(OrderStatus status){

        return em.createQuery(COUNT_BY_STATUS, Long.class)
                .setParameter("status", status)
                .getSingleResult();
    }

    public List<OrderPojo> getPagedOrders(int pageNumber, int pageSize) {
        return selectPaged(pageNumber * pageSize, pageSize, "id");
    }

    public long getTotalCountOfOrders() {
        return countAllRowsInTable();
    }
}
