package com.increff.project.controller;

import com.increff.project.dto.ClientDTO;
import com.increff.project.model.form.ClientForm;
import com.increff.project.model.data.ClientData;
import com.increff.project.model.form.PageSizeForm;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/client")
public class ClientController {

   @Autowired
   private ClientDTO clientDTO;

    /* -------- CREATE -------- */
    @RequestMapping(method = RequestMethod.POST, path = "/addClient")
    @ResponseStatus(HttpStatus.CREATED)
    public void addClient(@Valid @RequestBody ClientForm form)
    {
        clientDTO.addClient(form);
    }

    @RequestMapping(method = RequestMethod.POST, path = "/name")
    public List<ClientData> findClientByName(@RequestBody ClientForm form) {
        return clientDTO.findClientByName(form);
    }

    @RequestMapping(method = RequestMethod.POST, path = "/pages")
    public Page<ClientData> getAllClientsPaginated(@RequestBody PageSizeForm form) {
        return clientDTO.getAllOrders(form);
    }
}
