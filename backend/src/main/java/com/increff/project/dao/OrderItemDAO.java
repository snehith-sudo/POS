package com.increff.project.dao;

import com.increff.project.entity.OrderItemPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrderItemDAO extends AbstractDAO<OrderItemPojo> {

    public OrderItemDAO(){super(OrderItemPojo.class);}

    public void addOrderItem(OrderItemPojo orderItem){insert(orderItem);}

    public List<OrderItemPojo> findOrderItemByProductIds(List<Integer> productIds) {

        return em.createQuery(
                        "SELECT oi FROM OrderItemPojo oi WHERE oi.productId IN :productIds",
                        OrderItemPojo.class
                )
                .setParameter("productIds", productIds)
                .getResultList();
    }

    public List<OrderItemPojo> findOrderItemByOrderId(int orderId) {

        return em.createQuery(
                        "SELECT oi FROM OrderItemPojo oi WHERE oi.orderId = :orderId",
                        OrderItemPojo.class
                )
                .setParameter("orderId", orderId)
                .getResultList();
    }


    public List<OrderItemPojo> getAllOrderItems(){return selectAll();}

    public List<OrderItemPojo> getAllPaginatedOrderItems(int page, int size){return selectAllPaginated(page,size);}
}
