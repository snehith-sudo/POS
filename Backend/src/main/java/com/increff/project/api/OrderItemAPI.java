package com.increff.project.api;

import com.increff.project.dao.OrderItemDAO;
import com.increff.project.entity.OrderItemPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.model.data.OrderItemData;
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
    public List<OrderItemData> findOrderItemByOrderId(int orderId){

        return orderItemDao.findOrderItemByOrderId(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addOrderItem(OrderItemPojo item)  throws ApiException {
        orderItemDao.addOrderItem(item);
    }
}
