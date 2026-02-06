package com.increff.project.dao;

import com.increff.project.entity.OrderPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrderDAO extends AbstractDAO<OrderPojo> {

    public OrderDAO(){super(OrderPojo.class);}

    public void createOrder(OrderPojo order){insert(order);}

    public void updateOrder(OrderPojo order){update(order);}

    public OrderPojo findByOrderId(int id){return findById(id);}

    public boolean existByOrderId(int id){return existsById(id);}

    public List<OrderPojo> getAllOrders(){return selectAll();}

    public List<OrderPojo> getAllPaginatedOrders(int page, int size)
    {return selectAllPaginated(page,size);}
}
