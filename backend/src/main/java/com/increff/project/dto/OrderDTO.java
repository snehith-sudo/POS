package com.increff.project.dto;

import com.increff.project.api.ProductAPI;
import com.increff.project.model.data.OrderData;
import com.increff.project.model.helpers.PageSizeHelper;
import com.increff.project.useCase.OrderFlow;
import com.increff.project.model.form.OrderCreationForm;
import com.increff.project.model.form.OrderForm;
import com.increff.project.model.form.OrderItemForm;
import com.increff.project.entity.InvoicePojo;
import com.increff.project.entity.OrderItemPojo;
import com.increff.project.model.utils.InvoiceService;
import com.increff.project.model.utils.InvoiceUtil;
import com.increff.project.model.utils.OrderUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import static com.increff.project.model.utils.OrderUtil.convertEntityToData;
import static com.increff.project.model.helpers.OrderHelper.convertFormToEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderDTO {

    @Autowired
    private OrderFlow orderFlow;

    @Autowired
    private InvoiceUtil invoiceUtil;

    @Autowired
    private ProductAPI productAPI;

    @Autowired
    private InvoiceService invoiceService;

    public void addOrder(OrderCreationForm form) {

        List<OrderItemPojo> newOrderItems = new ArrayList<>();

        for (OrderItemForm itemForm : form.getItems()) {
            OrderItemPojo entity = convertFormToEntity(itemForm);
            entity.setProductId((productAPI.getByBarcode(itemForm.getBarcode())).getId());
            newOrderItems.add(entity);
        }
        orderFlow.createOrder(newOrderItems);
    }

    public void updateOrder(OrderForm form) {

        List<OrderItemPojo> Items = orderFlow.getAllOrderItemsWithOrderId(form.getOrderId());
        List<InvoicePojo> InvoiceItems = new ArrayList<>();

        for(OrderItemPojo item:Items) {
            InvoicePojo entity = new InvoicePojo();

            String productName = productAPI.findByProductId(item.getProductId()).getName();
            String barcode = productAPI.findByProductId(item.getProductId()).getBarcode();

            entity.setOrderId(item.getOrderId());
            entity.setProductName(productName);
            entity.setBarcode(barcode);
            entity.setQuantity(item.getOrderedQty());
            entity.setSellingPrice(item.getSellingPrice());
            InvoiceItems.add(entity);
        }

        String base64Pdf = invoiceUtil.generateInvoice(InvoiceItems);
        System.out.println(base64Pdf);

        invoiceService.generateInvoiceFromBase64(base64Pdf);

        orderFlow.updateOrderStatus(form.getOrderId());
    }

    public List<OrderData> getAllOrders() {
        return orderFlow.getAllOrders()
                .stream()
                .map(OrderUtil::convertEntityToData)
                .collect(Collectors.toList());
    }

    public OrderData findByOrderId(int id){
        return convertEntityToData(orderFlow.findByOrderId(id));
    }

    public List<OrderData> getAllPaginatedOrders(PageSizeHelper form)
    {

        return orderFlow.getAllPaginatedOrders(form.getPage(), form.getSize())
                .stream()
                .map(OrderUtil::convertEntityToData)
                .collect(Collectors.toList());
    }
}
