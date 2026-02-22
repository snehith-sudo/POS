package com.increff.project.api;

import com.increff.project.dao.InventoryDAO;
import com.increff.project.entity.InventoryPojo;
import com.increff.project.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class InventoryAPI {

    @Autowired
    private InventoryDAO inventoryDao;


    @Transactional(rollbackFor = Exception.class)
    public void addInventoryItem(InventoryPojo Item) throws ApiException {
        inventoryDao.addNewInventoryItem(Item);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateInventoryItem(InventoryPojo Item) throws ApiException {
        inventoryDao.updateInventoryItem(Item);
    }

    @Transactional(readOnly = true)
    public InventoryPojo findInventoryItemByProductId(Long productId){
        return inventoryDao.findInventoryItemByProductId(productId);
    }

    @Transactional(readOnly = true)
    public boolean existInventoryItemByProductId(Long productId){
        return inventoryDao.existInventoryItemByProductId(productId);
    }

    @Transactional(readOnly = true)
    public List<InventoryPojo> getAllProductIdsFromInventoryTable() {
        return inventoryDao.getAllProductIdsFromInventoryTable();
    }

    @Transactional(readOnly = true)
    public Page<InventoryPojo> getPagedInventory(int pageNumber, int pageSize)
    {
        List<InventoryPojo> orders = inventoryDao.getPagedInventory(pageNumber, pageSize);
        long totalElements = inventoryDao.getTotalRowsCountOfInventory();
        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize, Sort.by("name").descending());
        return new PageImpl<>(orders, pageRequest, totalElements);
    }

}
