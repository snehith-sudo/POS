package com.increff.project.useCase;

import com.increff.project.api.ClientAPI;
import com.increff.project.entity.ClientPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Transactional
public class ClientFlow {

    @Autowired
    private ClientAPI clientAPI;

    @Transactional(rollbackFor = Exception.class)
    public void addClient(ClientPojo client) {clientAPI.addClient(client);}

    @Transactional(readOnly = true)
    public ClientPojo findByName(ClientPojo client) {return clientAPI.findClientByName(client.getName());}

    @Transactional(readOnly = true)
    public List<ClientPojo> getAll(){return clientAPI.getAllClients();}

    @Transactional(readOnly = true)
    public List<ClientPojo> getAllPaginated(int page, int size)
    {
        System.out.println("page "+page+" size "+size);

        return clientAPI.getAllClientsPaginated(page,size);}
}
//
