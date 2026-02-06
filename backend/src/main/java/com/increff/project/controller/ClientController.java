package com.increff.project.controller;

import com.increff.project.dto.ClientDTO;
import com.increff.project.model.form.ClientForm;
import com.increff.project.model.data.ClientData;
import com.increff.project.model.helpers.PageSizeHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/client")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientController {

   @Autowired
   private ClientDTO clientDTO;

    /* -------- CREATE -------- */
    @RequestMapping(method = RequestMethod.POST, path = "/addClient")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void addClient(@Valid @RequestBody ClientForm form)
    {
        clientDTO.addClient(form);
    }

    /* -------- READ (PAGINATED) -------- */
    @RequestMapping(method = RequestMethod.POST,path = "/pages")
    public List<ClientData> getAllClientsPaginated(@RequestBody PageSizeHelper form)
    {
        System.out.println("Function Called");
        return clientDTO.getAllClientsPaginated(form);
    }

    @RequestMapping(method = RequestMethod.POST, path = "/{name}")
    public ClientData findByName(@RequestBody ClientForm form) {
        return clientDTO.findByName(form);
    }

    @RequestMapping(method = RequestMethod.GET, path = "/getAll")
    public List<ClientData> getAll() {
        return clientDTO.getAllClients();
    }
}
