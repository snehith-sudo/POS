package com.increff.project.dto;

import com.increff.project.model.data.OrderItemData;
import com.increff.project.useCase.OrderItemFlow;
import com.increff.project.model.form.OrderItemsInput;
import com.increff.project.model.helpers.AbstractValidateNormalize;
import com.increff.project.entity.OrderItemPojo;
import com.increff.project.model.utils.OrderItemUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderItemDTO extends AbstractValidateNormalize {

    @Autowired
    private OrderItemFlow orderItemFlow;

    public List<OrderItemData> findByOrderId(OrderItemsInput form)
    {
        validateNormalizeOrderItems(form);

        List<OrderItemPojo> Entities =  orderItemFlow.findOrderItemByOrderId(form.getId());

        return Entities.stream()
                .map(OrderItemUtil::convertEntityToData)
                .toList();
    }

    public List<OrderItemData> getAll(){
        return  orderItemFlow.getAllOrderItems()
                .stream()
                .map(OrderItemUtil::convertEntityToData)
                .collect(Collectors.toList());
    }

    public List<OrderItemData> getAllPaginated(int page,int size)
    {
        return  orderItemFlow.getAllPaginatedOrderItems(page,size)
                .stream()
                .map(OrderItemUtil::convertEntityToData)
                .collect(Collectors.toList());
    }

    public void validateNormalizeOrderItems(OrderItemsInput form)
    {
        validateNormalizeInteger(form.getId(),"Order Id");
    }
}
