package com.increff.project.useCase;

import com.increff.project.api.OrderItemAPI;
import com.increff.project.entity.OrderItemPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
@Service
public class OrderItemFlow {

    @Autowired
    private OrderItemAPI orderItemAPI;

    @Transactional(readOnly = true)
    public List<OrderItemPojo> getAllOrderItems()
    {return orderItemAPI.getAllOrderItems();}

    @Transactional(readOnly = true)
    public List<OrderItemPojo> getAllPaginatedOrderItems(int page, int size)
    {return orderItemAPI.getAllPaginatedOrderItems(page,size);}

    @Transactional(readOnly = true)
    public List<OrderItemPojo> findOrderItemByOrderId(Integer orderIds)
    {return orderItemAPI.findOrderItemsByOrderIds(orderIds);}
}
