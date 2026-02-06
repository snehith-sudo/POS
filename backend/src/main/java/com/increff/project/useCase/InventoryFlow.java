package com.increff.project.useCase;

import com.increff.project.api.InventoryAPI;
import com.increff.project.api.ProductAPI;
import com.increff.project.exception.ApiException;
import com.increff.project.model.helpers.TsvParserHelper;
import com.increff.project.entity.InventoryPojo;
import com.increff.project.entity.ProductPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryFlow {

    @Autowired
    private InventoryAPI inventoryAPI;

    @Autowired
    private ProductAPI productAPI;

    @Transactional(rollbackFor = Exception.class)
    public void addSingleInventoryItem(InventoryPojo Item, String barcode)
    {
        ProductPojo product = productAPI.getByBarcode(barcode);
        if(Objects.isNull(product))
        {
            throw new ApiException("Item is not present in DB , Barcode not matched");
        }
        if(inventoryAPI.existInventoryItemByProductId(product.getId()))
        {
            throw new ApiException("Item with this Product ID already present,Try updating this inventory");
        }
        Item.setProductId(product.getId());
        inventoryAPI.addInventoryItem(Item);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateSingleInventoryItem(InventoryPojo Item,String barcode)
    {
        ProductPojo product = productAPI.getByBarcode(barcode);
        if(Objects.isNull(product))
        {
            throw new ApiException("Item is not present in DB , Barcode not matched");
        }

        InventoryPojo inventoryItem = inventoryAPI.findInventoryItemByProductId(product.getId());
        if(Objects.isNull(inventoryItem))
        {
            throw new ApiException("Item with this Product ID not present,Try creat this inventory");
        }
       System.out.println("invenotry quantity "+inventoryItem.getQuantity());
        System.out.println("new quantity "+Item.getQuantity());

        if(inventoryItem.getQuantity() > Item.getQuantity() ){
            throw new ApiException("Can't decrease the quantity without ordering");
        }

        Item.setId(inventoryItem.getId());
        Item.setProductId(product.getId());
        System.out.println("Id "+Item.getId());
        System.out.println("prod id "+ Item.getProductId());
        System.out.println("quantity "+Item.getQuantity());
        inventoryAPI.updateInventoryItem(Item);
    }

    @Transactional(readOnly = true)
    public void validateStock(int productId,int requiredQty)
    {
        InventoryPojo inventory = inventoryAPI.findInventoryItemByProductId(productId);

        if (Objects.isNull(inventory)) {
            throw new ApiException("Inventory not found for productId: " + productId);
        }

        if (inventory.getQuantity() < requiredQty) {
            throw new ApiException(
                    "Insufficient stock for productId: " + productId +
                            ". Available: " + inventory.getQuantity() +
                            ", Required: " + requiredQty
            );
        }
    }

    @Transactional(readOnly = true)
    public void deductStock(int productId, int qty) {

        InventoryPojo inventory = inventoryAPI.findInventoryItemByProductId(productId);

        if (Objects.isNull(inventory)) {
            throw new ApiException("Inventory not found for productId: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() - qty);
        inventoryAPI.updateInventoryItem(inventory);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<Map<String, Object>> getAllInventoryItems() {

        List<Map<String, Object>> result = new ArrayList<>();

        List<InventoryPojo> entities = inventoryAPI.getAllInventoryItems();

        for (InventoryPojo entity : entities) {

            ProductPojo prod = productAPI.findByProductId(entity.getProductId());

            Map<String, Object> map = new HashMap<>();
            map.put("id",entity.getId());
            map.put("barcode", prod.getBarcode());
            map.put("name", prod.getName());
            map.put("quantity", entity.getQuantity());
            map.put("Mrp",prod.getMrp());

            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllPaginatedInventoryItems(int page, int size)
    {
        List<Map<String, Object>> result = new ArrayList<>();

        List<InventoryPojo> entities =  inventoryAPI.getAllPaginatedItems(page,size);

        for (InventoryPojo entity : entities) {

            ProductPojo prod = productAPI.findByProductId(entity.getProductId());

            Map<String, Object> map = new HashMap<>();
            map.put("id",entity.getId());
            map.put("barcode", prod.getBarcode());
            map.put("name", prod.getName());
            map.put("quantity", entity.getQuantity());
            map.put("Mrp",prod.getMrp());

            result.add(map);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String ,Object> findInventoryItemByBarcode(String barcode)
    {
        ProductPojo prod = productAPI.getByBarcode(barcode);
        int productId =  prod.getId();

        InventoryPojo entity =  inventoryAPI.findInventoryItemByProductId(productId);

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",entity.getId());
        map.put("barcode", prod.getBarcode());
        map.put("name", prod.getName());
        map.put("quantity", entity.getQuantity());
        map.put("Mrp",prod.getMrp());

        return map;
    }

    //TODO return a Error TSV FILE
    //TODO Header check in DTO
    public Map<String, String> uploadProductWiseInventory(List<String[]> rows)
    {
        Map<String, String> results = new LinkedHashMap<>();
        Set<String> seenBarcodes = new HashSet<>();
        List<String> allBarcodes = new ArrayList<>();

        // 1. Validate structure + collect barcodes
        for (String[] row : rows) {allBarcodes.add(row[0].trim());}

        // 2. Fetch existing barcodes in ONE DB call // returns all addable id & barcodes
        List<Object[]> existingBarcodes = productAPI.selectExistingBarcodes(allBarcodes);
        Set<String> existingBarcodeSet = existingBarcodes.stream()
                                         .map(row -> (String) row[0])
                                          .collect(Collectors.toSet());

        Map<String, Integer> barcodeToIdMap =  existingBarcodes.stream()
                                              .collect(Collectors.toMap(
                                              row -> (String) row[0],
                                              row -> (Integer) row[1]
                                               ));

        // 3 Getting all Product-Id's present in Inventory Database
        List<Integer> existingProductIdsInInventoryTable = inventoryAPI.getAllProductIds();

        //Get Barcodes for these All existing Product Id's
        List<String> existingBarcodesInInventoryTable = productAPI.selectExistingBarcodesFromProductId(existingProductIdsInInventoryTable);

        // 4. Process rows
        for (String[] row : rows) {

            String barcode = row[0].trim();
            int quantity;

            // Quantity parsing
            try {
                quantity = Integer.parseInt(row[1].trim());
            } catch (NumberFormatException e) {
                results.put(barcode, "Invalid quantity");
                continue;
            }

            if (quantity < 0) {
                results.put(barcode, "Quantity cannot be negative");
                continue;
            }

            if (!seenBarcodes.add(barcode)) {
                results.put(barcode, "Duplicate barcode in TSV");
                continue;
            }

            if (!existingBarcodeSet.contains(barcode)) {
                results.put(barcode, "Barcode does not exist ,Matching productId is not found");
                continue;
            }
            if(existingBarcodesInInventoryTable.contains(barcode)){
                results.put(barcode, "Barcode exist in Inventory Table,So Try updating the Item");
                continue;
            }

            InventoryPojo entity = new InventoryPojo();
            entity.setProductId(barcodeToIdMap.get(barcode));
            entity.setQuantity(quantity);

            addSingleInventoryItem(entity,barcode);
            results.put(barcode, "SUCCESS");
        }

        return results;
    }
}
