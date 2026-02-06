package com.increff.project.useCase;

import com.increff.project.api.OrderAPI;
import com.increff.project.api.OrderItemAPI;
import com.increff.project.api.ProductAPI;
import com.increff.project.exception.ApiException;
import com.increff.project.entity.OrderPojo;
import com.increff.project.entity.OrderItemPojo;
import com.increff.project.entity.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
@Service
@Transactional
public class OrderFlow {

    @Autowired
    private OrderAPI orderAPI;

    @Autowired
    private OrderItemAPI orderItemAPI;

    @Autowired
    private ProductAPI productAPI;

    @Autowired
    private InventoryFlow inventoryFlow;

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(List<OrderItemPojo> items) {

        if (items == null || items.isEmpty()) {
            throw new ApiException("Order must contain at least one item");
        }

        // 1️⃣ Validate products
        for (OrderItemPojo item : items) {
            if (!productAPI.existByProductId(item.getProductId())) {
                throw new ApiException("Invalid productId: " + item.getProductId());
            }
        }

        // 2️⃣ Create order
        int orderId = orderAPI.createOrder();

        // 3️⃣ Save order items
        for (OrderItemPojo item : items) {

            int productId = item.getProductId();
            int requiredQty = item.getOrderedQty();
            inventoryFlow.validateStock(productId,requiredQty);
            inventoryFlow.deductStock(productId,requiredQty);

            item.setOrderId(orderId);
            orderItemAPI.addOrderItem(item);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(int orderId)
    {
        OrderPojo order = orderAPI.findByOrderId(orderId);
        order.setStatus(OrderStatus.INVOICED);
        orderAPI.updateOrderStatus(order);
    }

    @Transactional(readOnly = true)
    public List<OrderItemPojo> getAllOrderItemsWithOrderId(int orderId)
    {
     return orderItemAPI.findOrderItemsByOrderIds(orderId);
    }

    @Transactional(readOnly = true)
    public List<OrderPojo> getAllOrders()
    {return orderAPI.getAllOrders();}

    @Transactional(readOnly = true)
    public List<OrderPojo> getAllPaginatedOrders(int page, int size)
    {return orderAPI.getAllPaginatedOrders(page,size);}

    @Transactional(readOnly = true)
    public OrderPojo findByOrderId(int id){return orderAPI.findByOrderId(id);}
}

