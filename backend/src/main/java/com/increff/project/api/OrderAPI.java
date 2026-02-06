package com.increff.project.api;

import com.increff.project.dao.OrderDAO;
import com.increff.project.entity.OrderPojo;
import com.increff.project.entity.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;
@Service
@Transactional
public class OrderAPI {

    @Autowired
    private OrderDAO orderDao;

    @Transactional(rollbackFor = Exception.class)
    public int createOrder()
    {
        OrderPojo order = new OrderPojo();
        order.setOrderTime(ZonedDateTime.now());
        order.setStatus(OrderStatus.CREATED);
        orderDao.createOrder(order);
        return order.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(OrderPojo updatedOrder) {
        orderDao.updateOrder(updatedOrder);
    }

    @Transactional(readOnly = true)
    public OrderPojo findByOrderId(int id){return orderDao.findByOrderId(id);}

    @Transactional(readOnly = true)
    public List<OrderPojo> getAllOrders() {
        return orderDao.getAllOrders();
    }

    @Transactional(readOnly = true)
    public List<OrderPojo> getAllPaginatedOrders(int page, int size) {
        return orderDao.getAllPaginatedOrders(page, size);
    }

}
