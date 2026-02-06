package com.increff.project.controller;

import com.increff.project.model.data.OrderData;
import com.increff.project.dto.OrderDTO;
import com.increff.project.model.form.OrderCreationForm;
import com.increff.project.model.form.OrderForm;
import com.increff.project.model.helpers.PageSizeHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private  OrderDTO orderDTO;

    /* -------- UPDATE -------- */
    @RequestMapping(method = RequestMethod.PUT, path = "/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
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
    public List<OrderData> getPaginatedOrders(@RequestBody PageSizeHelper form) {
        return orderDTO.getAllPaginatedOrders(form);
    }

    @RequestMapping(method = RequestMethod.GET, path = "/getAll")
    public List<OrderData> getAllOrders() {
        return orderDTO.getAllOrders();
    }

    /* -------- READ BY ID -------- */
    @RequestMapping(method = RequestMethod.GET, path = "/{id}")
    public OrderData findByOrderId(@PathVariable int id) {
        return orderDTO.findByOrderId(id);
    }
}