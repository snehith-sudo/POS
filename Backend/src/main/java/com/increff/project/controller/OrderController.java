package com.increff.project.controller;

import com.increff.project.model.data.OrderData;
import com.increff.project.model.form.*;
import com.increff.project.dto.OrderDTO;
import com.increff.project.model.data.OrderItemData;
import com.increff.project.model.form.PageSizeForm;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private  OrderDTO orderDTO;

    /*--------OrderItem Method --------*/
    @RequestMapping(method = RequestMethod.POST, path = "/id")
    public List<OrderItemData> getByOrderId(@RequestBody OrderItemsInput form) {
        return orderDTO.findByOrderId(form);
    }

    /* -------- UPDATE -------- */
    @RequestMapping(method = RequestMethod.PUT, path = "/update")
    @ResponseStatus(HttpStatus.CREATED)
    public void updateOrderStatus(@Valid @RequestBody OrderForm form) {
        orderDTO.updateOrder(form);
    }

    /* -------- CREATE -------- */
    @RequestMapping(method = RequestMethod.POST,path = "/createOrder")
    @ResponseStatus(HttpStatus.CREATED)
    public void createOrderItems(@Valid @RequestBody OrderCreationForm form) {
        orderDTO.addOrder(form);
    }

    /* -------- READ (PAGINATED) -------- */
    @RequestMapping(method = RequestMethod.POST,path = "/pages")
    public Page<OrderData> getPaginatedOrders(@RequestBody PageSizeForm form) {
        return orderDTO.getAllOrders(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/orderId")
    public List<OrderItemData> findOrderItemById(@RequestBody OrderForm form)
    {
        return orderDTO.findOrderItemBy(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/dates")
    public Page<OrderData> findOrdersBetweenDates(@RequestBody DatesForm form){
        return orderDTO.findOrdersBetweenDates(form);
    }
    @RequestMapping(method = RequestMethod.POST,path = "/orderStatus")
    public Page<OrderData> getOrderByStatus(@RequestBody StatusForm form){
        return orderDTO.getOrderByStatus(form);
    }

}