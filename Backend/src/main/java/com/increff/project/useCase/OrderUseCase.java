package com.increff.project.useCase;

import com.increff.project.api.OrderAPI;
import com.increff.project.api.OrderItemAPI;
import com.increff.project.api.ProductAPI;

import com.increff.project.entity.ProductPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.entity.OrderPojo;
import com.increff.project.entity.OrderItemPojo;
import com.increff.project.model.constants.OrderStatus;
import com.increff.project.model.data.OrderItemData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.ZonedDateTime;
import java.util.List;
@Service
@Transactional
public class OrderUseCase {

    @Autowired
    private OrderAPI orderAPI;

    @Autowired
    private OrderItemAPI orderItemAPI;

    @Autowired
    private ProductAPI productAPI;

    @Autowired
    private InventoryUseCase inventoryUseCase;

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(List<OrderItemPojo> items) {

        if (items == null || items.isEmpty()) {
            throw new ApiException("Order must contain at least one item");
        }

        // Save order items
        for (OrderItemPojo item : items) {
            Long productId = item.getProductId();
            Integer requiredQty = item.getOrderedQty();
            inventoryUseCase.validateStock(productId,requiredQty);
            inventoryUseCase.deductStock(productId,requiredQty);
        }

        //Create order
        Long orderId = orderAPI.createOrder();

        for(OrderItemPojo item:items){
            item.setOrderId(orderId);
            orderItemAPI.addOrderItem(item);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(int orderId){

        OrderPojo order = orderAPI.findByOrderId(orderId);
        order.setStatus(OrderStatus.INVOICED);
        orderAPI.updateOrderStatus(order);
    }

    public ProductPojo getProductByBarcode(String barcode){
        return productAPI.getProductByBarcode(barcode);
    }

    @Transactional(readOnly = true)
    public Page<OrderPojo> getAllOrders(int pageNumber, int pageSize){
    return orderAPI.getAllOrders(pageNumber,pageSize);
    }

    @Transactional(readOnly = true)
    public Page<OrderPojo> findOrdersBetweenDates(ZonedDateTime startDate,
                                            ZonedDateTime endDate,
                                            int page,
                                            int size){

        return orderAPI.findOrdersBetweenDates(startDate,endDate,page,size);
    }

    @Transactional(readOnly = true)
    public Page<OrderPojo> getOrderByStatus(OrderStatus status,
                                            int page,
                                            int size){

        return orderAPI.getOrderByStatus(status,page,size);
    }

    @Transactional(readOnly = true)
    public List<OrderItemData> findOrderItemByOrderId(Integer orderId) {

        return orderItemAPI.findOrderItemByOrderId(orderId);
    }
}

