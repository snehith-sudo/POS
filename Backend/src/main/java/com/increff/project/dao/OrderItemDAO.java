package com.increff.project.dao;

import com.increff.project.entity.OrderItemPojo;
import com.increff.project.model.data.OrderItemData;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class OrderItemDAO extends AbstractDAO<OrderItemPojo> {

    // ---------- JPQL QUERIES ----------
    private static final String FIND_ITEMS_BY_ORDER_ID =
            "SELECT oi.orderId, oi.orderedQty, oi.sellingPrice, p.barcode, p.name, oi.id " +
                    "FROM OrderItemPojo oi JOIN ProductPojo p ON p.id = oi.productId " +
                    "WHERE oi.orderId = :orderId";
    // ----------------------------------

    public OrderItemDAO(){
        super(OrderItemPojo.class);
    }

    public void addOrderItem(OrderItemPojo orderItem){
        addNewEntity(orderItem);
    }

    public List<OrderItemData> findOrderItemByOrderId(int orderId) {

        List<Object[]> result = em.createQuery(FIND_ITEMS_BY_ORDER_ID, Object[].class)
                .setParameter("orderId", orderId)
                .getResultList();

        List<OrderItemData> listData = new ArrayList<>();

        for(Object[] row : result) {
            OrderItemData data = new OrderItemData();
            data.setOrderId((Long) row[0]);
            data.setOrderedQty((Integer) row[1]);
            data.setSellingPrice((double) row[2]);
            data.setBarcode((String) row[3]);
            data.setName((String) row[4]);
            data.setOrderItemId((Long) row[5]);
            listData.add(data);
        }
        return listData;
    }
}
