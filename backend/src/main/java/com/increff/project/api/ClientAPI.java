package com.increff.project.api;

import com.increff.project.dao.ClientDAO;
import com.increff.project.entity.ClientPojo;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.increff.project.exception.ApiException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class ClientAPI {

    @Autowired
    private ClientDAO clientDAO;

    /* Adding a new Client */
    @Transactional(rollbackFor = Exception.class)
    public void addClient(ClientPojo client)
    {
        ClientPojo existing = clientDAO.findClientbyName(client.getName());
        if(!Objects.isNull(existing)) {throw new ApiException("Client already exists");}
        clientDAO.addClient(client);
    }

    /* Finding by Name*/
    @Transactional(readOnly = true)
    public ClientPojo findClientByName(String name)
    {
        ClientPojo entity =  clientDAO.findClientbyName(name);
        if(Objects.isNull(entity)) {
            throw new ApiException("Invalid clientId: " + name);
        }
        return entity;
    }

    /* Finding by Id*/
    @Transactional(readOnly = true)
    public boolean existClientById(int id){return clientDAO.existbyClientId(id);}

    @Transactional(readOnly = true)
    public List<ClientPojo> getAllClientsPaginated(int page, int size)
    {return clientDAO.selectAllPaginatedClients(page, size);}

    @Transactional(readOnly = true)
    public List<ClientPojo> getAllClients()
    {return clientDAO.selectAllClients();}


    @Transactional(readOnly = true)
    public List<Integer> getExistingClientIds(Set<Integer> clientIds)
    {
        if (Objects.isNull(clientIds) || clientIds.isEmpty()) {return List.of();}
        return clientDAO.selectExistingClientIds(new ArrayList<>(clientIds));
    }
}
