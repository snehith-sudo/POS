package com.increff.project.dao;

import com.increff.project.entity.InventoryPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class InventoryDAO extends AbstractDAO<InventoryPojo> {

    // ---------- JPQL QUERIES ----------
    private static final String FIND_BY_PRODUCT_ID =
            "SELECT i FROM InventoryPojo i WHERE i.productId = :productId";

    private static final String SELECT_ALL =
            "SELECT i FROM InventoryPojo i";
    // ----------------------------------

    public InventoryDAO() {
        super(InventoryPojo.class);
    }

    public void addNewInventoryItem(InventoryPojo item){
        addNewEntity(item);
    }

    public void updateInventoryItem(InventoryPojo item){
        update(item);
    }

    public InventoryPojo findInventoryItemByProductId(Long productId) {
        return em.createQuery(FIND_BY_PRODUCT_ID, InventoryPojo.class)
                .setParameter("productId", productId)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public boolean existInventoryItemByProductId(Long productId) {
        return em.createQuery(FIND_BY_PRODUCT_ID, InventoryPojo.class)
                .setParameter("productId", productId)
                .getResultStream()
                .findFirst()
                .isPresent();
    }

    public List<InventoryPojo> getAllProductIdsFromInventoryTable(){
        return em.createQuery(SELECT_ALL, InventoryPojo.class)
                .getResultList();
    }

    public List<InventoryPojo> getPagedInventory(Integer pageNumber, Integer pageSize) {
        return selectPaged(pageNumber * pageSize, pageSize, "quantity");
    }

    public long getTotalRowsCountOfInventory() {
        return countAllRowsInTable();
    }
}
