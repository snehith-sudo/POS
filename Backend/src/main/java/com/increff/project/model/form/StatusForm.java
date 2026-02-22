package com.increff.project.model.form;

import com.increff.project.model.constants.OrderStatus;
import lombok.Data;

@Data
public class StatusForm {
   private OrderStatus status;
   private Integer page;
   private Integer size;
}
