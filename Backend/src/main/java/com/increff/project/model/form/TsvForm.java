package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class TsvForm {

    @NotBlank(message = "Received Empty String")
    private String base64file;
}
