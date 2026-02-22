package com.increff.project.model.form;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class OrderCreationForm {

    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemForm> items;
}
