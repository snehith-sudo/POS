package com.increff.project.useCase;

import com.increff.project.api.InventoryAPI;
import com.increff.project.api.ProductAPI;
import com.increff.project.exception.ApiException;
import com.increff.project.entity.InventoryPojo;
import com.increff.project.entity.ProductPojo;
import com.increff.project.model.data.TsvData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryUseCase {

    @Autowired
    private InventoryAPI inventoryAPI;

    @Autowired
    private ProductAPI productAPI;

    @Transactional(rollbackFor = Exception.class)
    public void addSingleInventoryItem(InventoryPojo Item, String barcode) throws ApiException{

        ProductPojo product = productAPI.getProductByBarcode(barcode);

        if(Objects.isNull(product)) {
            throw new ApiException("Item is not present in DB , Barcode not matched");
        }

        Long productId = product.getId();
        Item.setProductId(productId);

        // If Inventory already present OverWrite it
        if(inventoryAPI.existInventoryItemByProductId(productId)) {

            InventoryPojo existingInventoryItem = inventoryAPI.findInventoryItemByProductId(productId);
            Item.setId(existingInventoryItem.getId());
            Item.setVersion(existingInventoryItem.getVersion());

            inventoryAPI.updateInventoryItem(Item);  // Updating the old item
        } else {                                     // Add a new Inventory Item
            inventoryAPI.addInventoryItem(Item);
        }
    }


    @Transactional(readOnly = true)
    public void validateStock(Long productId,Integer requiredQty) {

        InventoryPojo inventory = inventoryAPI.findInventoryItemByProductId(productId);

        if (Objects.isNull(inventory)) {
            throw new ApiException("Order Not Created \n Inventory not found for productId: " + productId);
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
    public void deductStock(Long productId, Integer qty) {

        InventoryPojo inventory = inventoryAPI.findInventoryItemByProductId(productId);

        if (Objects.isNull(inventory)) {
            throw new ApiException("Order Not Created \n Inventory not found for productId: " + productId);
        }

        inventory.setQuantity(inventory.getQuantity() - qty);
        inventoryAPI.updateInventoryItem(inventory);
    }

    @Transactional(readOnly = true)
    public InventoryPojo findInventoryItemByBarcode(String barcode) {

        ProductPojo prod = productAPI.getProductByBarcode(barcode);
        if(Objects.isNull(prod)){
            return null;
        }
        Long productId =  prod.getId();

        return  inventoryAPI.findInventoryItemByProductId(productId);
    }

    @Transactional(readOnly = true)
    public Page<InventoryPojo> getPagedInventory(int pageNumber, int pageSize){
        return inventoryAPI.getPagedInventory(pageNumber,pageSize);
    }

    @Transactional(readOnly = true)
    public List<ProductPojo> selectExistingProductsWithIds(Page<InventoryPojo> inventoryPojoPage){

        List<Long> productIds = inventoryPojoPage.getContent()
                .stream()
                .map(InventoryPojo::getProductId)
                .toList();

        return productAPI.selectExistingProductsWithIds(productIds);
    }

    public ProductPojo getProductItemByBarcode(String barcode){
        return productAPI.getProductByBarcode(barcode);
    }

    public List<TsvData> uploadProductWiseInventory(List<String[]> rows) {

        List<TsvData> results = new ArrayList<>();

        List<String> allBarcodes = rows.stream()
                                   .map(row -> row[0])
                                   .toList();

        // 2️⃣ Load required data from DB
        ProductContext productContext = loadProductContext(allBarcodes);

        // 3️⃣ Process each row
        Set<String> seenBarcodes = new HashSet<>();

        for (String[] row : rows) {
            processSingleRow(row, seenBarcodes, productContext, results);
        }

        return results;
    }



    private ProductContext loadProductContext(List<String> allBarcodes) {

        List<ProductPojo> existingProducts =  productAPI.selectExistingBarcodes(allBarcodes);

        Set<String> existingBarcodeSet = existingProducts.stream()
                                                        .map(ProductPojo::getBarcode)
                                                        .collect(Collectors.toSet());

        Map<String, Long> barcodeToIdMap =
                                                existingProducts.stream()
                                                        .collect(Collectors.toMap(
                                                                ProductPojo::getBarcode,
                                                                ProductPojo::getId));

        List<Long> productIdsInInventory =
                                                inventoryAPI.getAllProductIdsFromInventoryTable()
                                                .stream()
                                                .map(InventoryPojo::getProductId)
                                                .toList();

        Set<String> barcodesInInventory =
                productAPI.selectExistingBarcodesFromProductId(productIdsInInventory)
                        .stream()
                        .map(ProductPojo::getBarcode)
                        .collect(Collectors.toSet());

        return new ProductContext(existingBarcodeSet, barcodeToIdMap, barcodesInInventory);
    }
    private static class ProductContext {
        Set<String> existingBarcodeSet;
        Map<String, Long> barcodeToIdMap;
        Set<String> barcodesInInventory;

        public ProductContext(Set<String> existingBarcodeSet,
                              Map<String, Long> barcodeToIdMap,
                              Set<String> barcodesInInventory) {
            this.existingBarcodeSet = existingBarcodeSet;
            this.barcodeToIdMap = barcodeToIdMap;
            this.barcodesInInventory = barcodesInInventory;
        }
    }
    private void processSingleRow(String[] row,
                                  Set<String> seenBarcodes,
                                  ProductContext context,
                                  List<TsvData> results) {

        String barcode = row[0].trim();
        int quantity = Integer.parseInt(row[1]);

        if (!seenBarcodes.add(barcode)) {
            results.add(new TsvData(barcode, "Duplicate barcode in TSV"));
            return;
        }

        if (!context.existingBarcodeSet.contains(barcode)) {
            results.add(new TsvData(barcode, "Barcode does not exist"));
            return;
        }

        if (context.barcodesInInventory.contains(barcode)) {
            handleInventoryUpdate(barcode, quantity, context, results);
            return;
        }

        createNewInventory(barcode, quantity, context, results);
    }

    /*Update the Inventory Item if existing Item is inserted  */
    private void handleInventoryUpdate(String barcode,
                                       Integer quantity,
                                       ProductContext context,
                                       List<TsvData> results) {

        Long productId = context.barcodeToIdMap.get(barcode);
        InventoryPojo existingItem = inventoryAPI.findInventoryItemByProductId(productId);

        if (existingItem.getQuantity() > quantity) {
            results.add(new TsvData(barcode, "Try updating the item manually"));
            return;
        }

        Long prodId = productAPI.getProductByBarcode(barcode).getId();
        InventoryPojo exisitng = inventoryAPI.findInventoryItemByProductId(productId);
        existingItem.setQuantity(quantity);
        inventoryAPI.updateInventoryItem(existingItem);

        results.add(new TsvData(barcode, "Inventory updated"));
    }

    /* Add new Inventory Item from the TSV File */
    private void createNewInventory(String barcode,
                                    int quantity,
                                    ProductContext context,
                                    List<TsvData> results) {

        InventoryPojo entity = new InventoryPojo();
        entity.setProductId(context.barcodeToIdMap.get(barcode));
        entity.setQuantity(quantity);

        addSingleInventoryItem(entity, barcode);

        results.add(new TsvData(barcode, "SUCCESS"));
    }
    private TsvData createTsvData(String barcode, String result) {
        TsvData data = new TsvData();
        data.setBarcode(barcode);
        data.setStatus(result);
        return data;
    }

}
