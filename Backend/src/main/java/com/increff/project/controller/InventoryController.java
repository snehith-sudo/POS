package com.increff.project.controller;

import com.increff.project.dto.InventoryDTO;
import com.increff.project.model.data.InventoryData;
import com.increff.project.model.data.TsvData;
import com.increff.project.model.form.InventoryForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.model.form.PageSizeForm;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryDTO inventoryDTO;

    /* Upload product-wise inventory via TSV */
    @RequestMapping(method = RequestMethod.POST, path = "/upload")
    public List<TsvData> uploadBulkInventoryItems(@Valid @RequestBody TsvForm form) {
       return inventoryDTO.uploadInventoryItem(form);
    }

    /* Add a Single Inventory Item */
    @RequestMapping(method = RequestMethod.POST)
    @ResponseStatus(HttpStatus.CREATED)
    public void uploadSingleInventory(@Valid @RequestBody InventoryForm form) {
        inventoryDTO.addSingleInventorItem(form);
    }

    @RequestMapping(method = RequestMethod.POST,path = "/pages")
    public Page<InventoryData> getPagedInventory(@RequestBody PageSizeForm form) {
        return inventoryDTO.getPagedInventory(form);
    }

    /* Find a single inventory item by productId */
    @RequestMapping(method = RequestMethod.POST, path = "/barcode")
    public Page<InventoryData> findInventoryItemByBarcode(@Valid @RequestBody InventoryForm form) {
        return inventoryDTO.findInventoryItemByBarcode(form);
    }

}