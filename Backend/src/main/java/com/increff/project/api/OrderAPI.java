package com.increff.project.api;

import com.increff.project.dao.OrderDAO;
import com.increff.project.entity.OrderPojo;
import com.increff.project.model.constants.OrderStatus;
import com.increff.project.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class OrderAPI {

    @Autowired
    private OrderDAO orderDao;

    @Transactional(rollbackFor = Exception.class)
    public Long createOrder() {

        OrderPojo order = new OrderPojo();

        order.setOrderTime(ZonedDateTime.now());
        order.setStatus(OrderStatus.CREATED);
        orderDao.createNewOrder(order);

        return order.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(OrderPojo updatedOrder) throws ApiException {
        orderDao.updateOrder(updatedOrder);
    }

    @Transactional(readOnly = true)
    public OrderPojo findByOrderId(int id) {

        OrderPojo order = orderDao.getOrderById(id);
        if (Objects.isNull(order)) {
            throw new ApiException("Order not found with ID:" + id);
        }
        return order;
    }

    @Transactional(readOnly = true)
    public Page<OrderPojo> findOrdersBetweenDates(ZonedDateTime startDate,
                                                  ZonedDateTime endDate,
                                                  int page,
                                                  int size) {

        List<OrderPojo> list = orderDao.findOrdersBetweenDates(startDate, endDate, page, size);
        long total = orderDao.getTotalCountOfOrdersBetweenDates(startDate, endDate);

        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(list, pageable, total);
    }

    @Transactional(readOnly = true)
    public Page<OrderPojo> getOrderByStatus(OrderStatus status,
                                            int page,
                                            int size) {

        List<OrderPojo> list = orderDao.getOrderByStatus(status, page, size);
        long total = orderDao.getTotalCountOfOrderByOrderStatus(status);

        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(list, pageable, total);
    }

    @Transactional(readOnly = true)
    public Page<OrderPojo> getAllOrders(int pageNumber, int pageSize) {

        List<OrderPojo> orders = orderDao.getPagedOrders(pageNumber, pageSize);

        long totalElements = orderDao.getTotalCountOfOrders();

        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize,
                Sort.by("name").descending());
        return new PageImpl<>(orders, pageRequest, totalElements);
    }


}
