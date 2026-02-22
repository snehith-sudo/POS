package com.increff.project.dto;

import com.increff.project.entity.OrderPojo;
import com.increff.project.model.form.InvoiceForm;
import com.increff.project.model.data.OrderData;
import com.increff.project.model.form.*;
import com.increff.project.model.data.OrderItemData;
import com.increff.project.useCase.OrderUseCase;
import com.increff.project.utils.helpers.AbstractValidateNormalize;
import com.increff.project.entity.OrderItemPojo;
import com.increff.project.model.form.PageSizeForm;
import com.increff.project.utils.utils.InvoiceService;
import com.increff.project.utils.utils.InvoiceUtil;
import com.increff.project.utils.utils.OrderUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.increff.project.utils.helpers.InvoiceHelper.convertOrderItemsToInvoiceForm;
import static com.increff.project.utils.helpers.OrderHelper.convertFormToEntity;

@Component
public class OrderDTO extends AbstractValidateNormalize {

    @Autowired
    private OrderUseCase orderUseCase;

    @Autowired
    private InvoiceUtil invoiceUtil;

    @Autowired
    private InvoiceService invoiceService;

    public void addOrder(OrderCreationForm form) {

        normalizeValidateOrderItems(form);
        List<OrderItemPojo> newOrderItems = new ArrayList<>();

        for (OrderItemForm itemForm : form.getItems())
        {
            System.out.println(itemForm);
            OrderItemPojo entity = convertFormToEntity(itemForm);
            Long productId = (orderUseCase.getProductByBarcode(itemForm.getBarcode())).getId();
            entity.setProductId(productId);
            newOrderItems.add(entity);
        }
        orderUseCase.createOrder(newOrderItems);
    }

    public void updateOrder(OrderForm form) {

        NormalizeValidateInteger(form.getOrderId(),"Order Id");
        int orderId = form.getOrderId();

        List<OrderItemData> Items = orderUseCase.findOrderItemByOrderId(orderId);
        List<InvoiceForm> InvoiceItems= convertOrderItemsToInvoiceForm(Items);

        String base64Pdf = invoiceUtil.generateInvoice(InvoiceItems);
        invoiceService.generateInvoiceFromBase64(base64Pdf);

        orderUseCase.updateOrderStatus(orderId);
    }

    public List<OrderItemData> findOrderItemBy(OrderForm form) {

        NormalizeValidateInteger(form.getOrderId(),"Order Id");
        return orderUseCase.findOrderItemByOrderId(form.getOrderId());
    }

    public Page<OrderData> getAllOrders(PageSizeForm form) {

        Page<OrderPojo> orderPojoPage= orderUseCase.getAllOrders(form.getPage(),form.getSize());

        List<OrderData> dataList = orderPojoPage.getContent()
                .stream()
                .map(OrderUtil::convertEntityToData)
                .collect(Collectors.toList());

        return new PageImpl<>(
                dataList,
                orderPojoPage.getPageable(),
                orderPojoPage.getTotalElements()
        );
    }

    public Page<OrderData> findOrdersBetweenDates(DatesForm form) {

        Page<OrderPojo> page = orderUseCase.findOrdersBetweenDates(form.getStartDate(), form.getEndDate(),
                form.getPage(), form.getSize());

        List<OrderData> dataList = page.getContent()
                .stream()
                .map(OrderUtil::convertEntityToData)
                .toList();

        return new PageImpl<>(
                dataList,
                page.getPageable(),
                page.getTotalElements()
        );
    }

    public Page<OrderData> getOrderByStatus(StatusForm form){

        Page<OrderPojo> page =  orderUseCase.getOrderByStatus(form.getStatus(),form.getPage(),form.getSize());

        List<OrderData> dataList = page.getContent()
                .stream()
                .map(OrderUtil::convertEntityToData)
                .toList();

        return new PageImpl<>(
                dataList,
                page.getPageable(),
                page.getTotalElements()
        );
    }
    public List<OrderItemData> findByOrderId(OrderItemsInput form) {

        validateNormalizeOrder(form);
        return   orderUseCase.findOrderItemByOrderId(form.getId());
    }

    public void normalizeValidateOrderItems(OrderCreationForm form){

        for(OrderItemForm orderItem: form.getItems()){
            // validating each order item

            orderItem.setBarcode(NormalizeValidateString(orderItem.getBarcode(),"Order Item Barcode"));
            NormalizeValidateInteger(orderItem.getOrderedQty(),"Ordered Quantity");
            orderItem.setSellingPrice(NormalizeValidateDouble(orderItem.getSellingPrice(),"Selling Price"));
        }
    }

    public void validateNormalizeOrder(OrderItemsInput form) {

        NormalizeValidateInteger(form.getId(),"Order Id");
    }
}
