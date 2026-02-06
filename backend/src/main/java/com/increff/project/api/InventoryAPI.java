package com.increff.project.api;

import com.increff.project.dao.InventoryDAO;
import com.increff.project.entity.InventoryPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InventoryAPI {

    @Autowired
    private InventoryDAO inventoryDao;


    @Transactional(rollbackFor = Exception.class)
    public void addInventoryItem(InventoryPojo Item){inventoryDao.addInventoryItem(Item);}

    @Transactional(rollbackFor = Exception.class)
    public void updateInventoryItem(InventoryPojo Item){inventoryDao.updateInventoryItem(Item);}

    @Transactional(readOnly = true)
    public InventoryPojo findInventoryItemByProductId(int productId) {return inventoryDao.findInventoryItemByProductId(productId);}

    @Transactional(readOnly = true)
    public boolean existInventoryItemByProductId(int productId){return inventoryDao.existInventoryItemByProductId(productId);}

    @Transactional(readOnly = true)
    public List<InventoryPojo> getAllInventoryItems(){return inventoryDao.getAllInventoryItems();}

    @Transactional(readOnly = true)
    public List<InventoryPojo> getAllPaginatedItems(int page, int size)
    {return inventoryDao.getPaginatedInventoryItems(page,size);}

    @Transactional(readOnly = true)
    public List<Integer> getAllProductIds()
    {
        return inventoryDao.getAllProductIds();
    }

}
