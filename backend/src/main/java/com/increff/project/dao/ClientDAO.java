package com.increff.project.dao;

import com.increff.project.entity.ClientPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ClientDAO extends AbstractDAO<ClientPojo> {

    public ClientDAO() {super(ClientPojo.class);}

    /* Adding a New Client */
    public void addClient(ClientPojo client) {insert(client);}

    /* Find by id*/
    public boolean existbyClientId(int id){return existsById(id);}

    /* Finding By name*/
    public ClientPojo findClientbyName(String name)
    {
        return findByName(name) ;
    }

    /* find multiple ids*/
    public List<Integer> selectExistingClientIds(List<Integer> clientIds) {
        return selectmultipleExistingIds(clientIds);
    }

    /* Selecting all without Pagination */
    public List<ClientPojo> selectAllClients() {return selectAll();  }

    /* Selecting all with Pagination */
    public List<ClientPojo> selectAllPaginatedClients(int page, int size) {return selectAllPaginated(page, size); }

}
