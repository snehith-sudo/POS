package com.increff.project.controller;

import com.increff.project.model.data.InventoryData;
import com.increff.project.dto.InventoryDTO;
import com.increff.project.model.form.InventoryForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.model.helpers.PageSizeHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {

    @Autowired
    private InventoryDTO inventoryDTO;

    /* Upload product-wise inventory via TSV */
    @RequestMapping(method = RequestMethod.POST, path = "/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadInventoryItems(@Valid @RequestBody TsvForm form) {
       return inventoryDTO.uploadInventoryItem(form);
    }

    /* Add a Single Inventory Item */
    @RequestMapping(method = RequestMethod.POST, path = "/singleupload")
    @ResponseStatus(HttpStatus.CREATED)
    public void uploadSingleInventory(@Valid @RequestBody InventoryForm form) {
        inventoryDTO.addSingleInventorItem(form);
    }

    /* Update a single Inventory */
    @RequestMapping(method = RequestMethod.PUT,path="/singleupdate")
    public void updateSingleInventoryItem(@Valid @RequestBody InventoryForm form)
    {
        inventoryDTO.updateSingleInventoryItem(form);
    }

    /* Get inventory (paginated) */
    @RequestMapping(method = RequestMethod.POST,path = "/pages")
    public List<Map<String, Object>> getAllInventoryItemsPaginated(@RequestBody PageSizeHelper form) {
        return inventoryDTO.getAllInventoryItemsPaginated(form);
    }

    /* Get all the Inventory */
    @RequestMapping(method = RequestMethod.GET, path = "/getAll")
    public List<Map<String, Object>> getAllInventoryItems() {
        return inventoryDTO.getAllInventoryItems();
    }

    /* Find a single inventory item by productId */
    @RequestMapping(method = RequestMethod.POST, path = "/barcode")
    public Map<String ,Object> findInventoryItemByBarcode(@Valid @RequestBody InventoryForm form) {
        return inventoryDTO.findInventoryItemByBarcode(form);
    }

}