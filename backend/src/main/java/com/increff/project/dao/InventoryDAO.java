package com.increff.project.dao;

import com.increff.project.entity.InventoryPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class InventoryDAO extends AbstractDAO<InventoryPojo> {

    public InventoryDAO() {super(InventoryPojo.class);}

    public void addInventoryItem(InventoryPojo Item){insert(Item);}

    public void updateInventoryItem(InventoryPojo Item){update(Item);}

    public InventoryPojo findInventoryItemByProductId(int productId) {
        return em.createQuery(
                        "select i from InventoryPojo i where i.productId = :productId",
                        InventoryPojo.class)
                .setParameter("productId", productId)
                .getResultStream()
                .findFirst()
                .orElse(null);
    }

    public boolean existInventoryItemByProductId(int productId)
    {
        return em.createQuery(
                        "select i from InventoryPojo i where i.productId = :productId",
                        InventoryPojo.class)
                .setParameter("productId", productId)
                .getResultStream()
                .findFirst()
                .isPresent();
    }

    public List<Integer> getAllProductIds(){
        return em.createQuery("SELECT i.productId FROM InventoryPojo i",Integer.class)
                .getResultList();
    }

    public List<InventoryPojo> getPaginatedInventoryItems(int page, int size){return selectAllPaginated(page,size);}

    public List<InventoryPojo> getAllInventoryItems(){return selectAll();}

}
