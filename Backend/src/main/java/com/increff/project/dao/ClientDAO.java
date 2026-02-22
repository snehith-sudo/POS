package com.increff.project.dao;

import com.increff.project.entity.ClientPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ClientDAO extends AbstractDAO<ClientPojo> {

    // ---------- JPQL QUERIES ----------
    private static final String COUNT_BY_NAME =
            "SELECT COUNT(e) FROM ClientPojo e WHERE e.name = :clientName";

    private static final String COUNT_BY_ID =
            "SELECT COUNT(e) FROM ClientPojo e WHERE e.id = :clientId";

    private static final String GET_BY_ID =
            "SELECT e FROM ClientPojo e WHERE e.id = :clientId";

    private static final String GET_BY_NAME =
            "SELECT e FROM ClientPojo e WHERE e.name = :name";

    private static final String GET_EXISTING_BY_NAMES =
            "SELECT e FROM ClientPojo e WHERE e.name IN :names";

    // ----------------------------------

    public ClientDAO() {
        super(ClientPojo.class);
    }

    public void addNewClient(ClientPojo client){
        addNewEntity(client);
    }

    public boolean checkClientByName(String clientName) {
        return em.createQuery(COUNT_BY_NAME, Long.class)
                .setParameter("clientName", clientName)
                .getSingleResult() > 0;
    }


    public ClientPojo getClientById(Long clientId){
        return em.createQuery(GET_BY_ID, ClientPojo.class)
                .setParameter("clientId", clientId)
                .getSingleResult();
    }

    public ClientPojo getClientByName(String clientName) {
        List<ClientPojo> results = em.createQuery(GET_BY_NAME, ClientPojo.class)
                .setParameter("name", clientName)
                .getResultList();

        return results.isEmpty() ? null : results.get(0);
    }

    public List<ClientPojo> selectExistingClientsUsingClientNames(List<String> clientNames) {

        if (clientNames == null || clientNames.isEmpty()) {
            return List.of();
        }

        return em.createQuery(GET_EXISTING_BY_NAMES, ClientPojo.class)
                .setParameter("names", clientNames)
                .getResultList();
    }

    public List<ClientPojo> selectExistingClientsWithClientIds(List<Long> clientIds){
        return selectExistingEntityWithIds(clientIds);
    }

    public List<ClientPojo> getPagedClients(int pageNumber, int pageSize){
        return selectPaged(pageNumber * pageSize, pageSize, "name");
    }

    public long getCountOfTotalClients() {
        return countAllRowsInTable();
    }
}
