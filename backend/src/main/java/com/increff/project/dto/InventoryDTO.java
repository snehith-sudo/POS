package com.increff.project.dto;


import com.increff.project.exception.ApiException;
import com.increff.project.model.data.InventoryData;
import com.increff.project.model.helpers.PageSizeHelper;
import com.increff.project.model.helpers.TsvParserHelper;
import com.increff.project.useCase.InventoryFlow;
import com.increff.project.model.form.InventoryForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.model.helpers.AbstractValidateNormalize;
import com.increff.project.entity.InventoryPojo;
import com.increff.project.model.utils.InventoryUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static com.increff.project.model.helpers.InventoryHelper.convertFormToEntity;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class InventoryDTO extends AbstractValidateNormalize {

    @Autowired
    private InventoryFlow inventoryFlow;

    /* TSV upload : product-wise inventory */
    public Map<String, String> uploadInventoryItem(TsvForm form)
    {
        String base64TSV = form.getBase64file();
        List<String[]> rows = TsvParserHelper.parseBase64Tsv(base64TSV);

        if (rows.isEmpty()) {throw new ApiException("TSV file is empty");}

        if (rows.size() > 5000) {throw new ApiException("TSV row limit exceeded (max 5000)");}

        // Checking the Header and columns length
        String[] header = rows.getFirst();
        if (header.length != 2 ||
                !header[0].trim().equalsIgnoreCase("barcode") ||
                !header[1].trim().equalsIgnoreCase("quantity")) {
            throw new ApiException("Invalid TSV header. Expected columns: 'barcode', 'quantity'");
        }

       return inventoryFlow.uploadProductWiseInventory(rows);
    }

    public void addSingleInventorItem(InventoryForm form)
    {
        validateNormalizeInventory(form);
        InventoryPojo InventoryItem = convertFormToEntity(form);
        inventoryFlow.addSingleInventoryItem(InventoryItem,form.getBarcode());
    }

    public void updateSingleInventoryItem(InventoryForm form)
    {
        validateNormalizeInventory(form);
        InventoryPojo InventoryItem = convertFormToEntity(form);
        inventoryFlow.updateSingleInventoryItem(InventoryItem,form.getBarcode());
    }

    public Map<String ,Object> findInventoryItemByBarcode(InventoryForm form)
    {
        String barcode = form.getBarcode();
        validateNormalizeString(barcode,"Barcode");
        return inventoryFlow.findInventoryItemByBarcode(barcode);
    }

    public List<Map<String, Object>> getAllInventoryItems() {
        return inventoryFlow.getAllInventoryItems();
    }

    public List<Map<String, Object>> getAllInventoryItemsPaginated(PageSizeHelper form)
    {
        validateNormalizeInteger(form.getPage(),"Page Number");
        validateNormalizeInteger(form.getSize(),"Size Number");
        return inventoryFlow.getAllPaginatedInventoryItems(form.getPage(), form.getSize());
    }
    public void validateNormalizeInventory(InventoryForm form)
    {
        validateNormalizeString(form.getBarcode(),"Barcode");
        validateNormalizeInteger(form.getQuantity(),"Quantity");
    }
}
