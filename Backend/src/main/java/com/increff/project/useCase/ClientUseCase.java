package com.increff.project.useCase;

import com.increff.project.api.ClientAPI;
import com.increff.project.entity.ClientPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Transactional
public class ClientUseCase {

    @Autowired
    private ClientAPI clientAPI;

    @Transactional(rollbackFor = Exception.class)
    public void addClient(ClientPojo client) {
        clientAPI.addClient(client);
    }

    @Transactional(readOnly = true)
    public ClientPojo getCheckClientByName(ClientPojo client){
        return clientAPI.getCheckClientByName(client.getName());
    }

    @Transactional(readOnly = true)
    public Page<ClientPojo> getAllPagedClients(int pageNumber, int pageSize){
        return clientAPI.getAllPagedClients(pageNumber,pageSize);
    }
}

