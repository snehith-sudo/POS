package com.increff.project.api;

import com.increff.project.dao.OrderItemDAO;
import com.increff.project.entity.OrderItemPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OrderItemAPI {

    @Autowired
    private OrderItemDAO orderItemDao;

    @Transactional(readOnly = true)
    public List<OrderItemPojo> getAllOrderItems() {return orderItemDao.getAllOrderItems();}

    @Transactional(readOnly = true)
    public List<OrderItemPojo> getAllPaginatedOrderItems(int page, int size)
    {return orderItemDao.getAllPaginatedOrderItems(page,size);}

    @Transactional(readOnly = true)
    public List<OrderItemPojo> findOrderItemsByOrderIds(Integer orderId) {return orderItemDao.findOrderItemByOrderId(orderId);}

    @Transactional(rollbackFor = Exception.class)
    public void addOrderItem(OrderItemPojo item) {
        orderItemDao.addOrderItem(item);
    }
}
