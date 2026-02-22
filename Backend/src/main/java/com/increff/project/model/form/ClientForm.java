package com.increff.project.model.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClientForm
{
    @NotBlank(message = "Client name cannot be empty")
    @NotNull
    private String name;

}
