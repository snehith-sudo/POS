package com.increff.project.api;

import com.increff.project.dao.ClientDAO;
import com.increff.project.entity.ClientPojo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    @Transactional(rollbackFor = Exception.class)
    public void addClient(ClientPojo client) throws ApiException {

        ClientPojo existing = clientDAO.getClientByName(client.getName());

        if(!Objects.isNull(existing)) {
            throw new ApiException("Client already exists");
        }

        clientDAO.addNewClient(client);
    }

    @Transactional(readOnly = true)
    public ClientPojo getCheckClientByName(String clientName){

        ClientPojo entity =  clientDAO.getClientByName(clientName);
        if(Objects.isNull(entity)) {
            return null;
        }
        return entity;
    }

    @Transactional(readOnly = true)
    public ClientPojo getClientById(Long id){
        return clientDAO.getClientById(id);
    }

    @Transactional(readOnly = true)
    public List<ClientPojo> selectExistingClientNames(Set<String> clientNames) {

        if (Objects.isNull(clientNames) || clientNames.isEmpty()) {
            return List.of();
        }
        return clientDAO.selectExistingClientsUsingClientNames(new ArrayList<>(clientNames));
    }

    @Transactional(readOnly = true)
    public List<ClientPojo> selectExistingClientWithIds(List<Long> clientIds) {

        if (Objects.isNull(clientIds) || clientIds.isEmpty()) {return List.of();}
        return clientDAO.selectExistingClientsWithClientIds(new ArrayList<Long>(clientIds));
    }

    @Transactional(readOnly = true)
    public Page<ClientPojo> getAllPagedClients(int pageNumber, int pageSize) {

        List<ClientPojo> orders = clientDAO.getPagedClients(pageNumber, pageSize);
        long totalElements = clientDAO.getCountOfTotalClients();
        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize, Sort.by("name").descending());
        return new PageImpl<>(orders, pageRequest, totalElements);
    }

}
