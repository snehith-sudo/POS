package com.increff.project.controller;

import com.increff.project.model.data.OrderItemData;
import com.increff.project.dto.OrderItemDTO;
import com.increff.project.model.form.OrderItemsInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orderitems")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderItemController {

    @Autowired
    private  OrderItemDTO orderItemDTO;

    /* -------- READ (PAGINATED) -------- */
    @RequestMapping(method = RequestMethod.GET)
    public List<OrderItemData> getAllPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return orderItemDTO.getAllPaginated(page, size);
    }

    /* -------- READ ALL -------- */
    @RequestMapping(method = RequestMethod.GET, path = "/all")
    public List<OrderItemData> getAll() {
        return orderItemDTO.getAll();
    }

    /* -------- READ BY ID -------- */
    @RequestMapping(method = RequestMethod.GET, path = "/{id}")
    public List<OrderItemData> getByOrderId(OrderItemsInput form) {
        return orderItemDTO.findByOrderId(form);
    }
}