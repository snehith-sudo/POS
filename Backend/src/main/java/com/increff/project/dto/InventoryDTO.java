package com.increff.project.dto;


import com.increff.project.entity.ProductPojo;
import com.increff.project.model.data.InventoryData;
import com.increff.project.model.data.TsvData;
import com.increff.project.useCase.InventoryUseCase;
import com.increff.project.model.form.InventoryForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.utils.helpers.AbstractValidateNormalize;
import com.increff.project.entity.InventoryPojo;
import com.increff.project.model.form.PageSizeForm;
import com.increff.project.utils.helpers.TsvParserHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;


import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.increff.project.utils.helpers.InventoryHelper.convertFormToEntity;
import static com.increff.project.utils.utils.InventoryUtil.convertEntityToData;

@Component
public class InventoryDTO extends AbstractValidateNormalize {

    @Autowired
    private InventoryUseCase inventoryUseCase;

    public List<TsvData> uploadInventoryItem(TsvForm form) {

        String base64TSV = form.getBase64file();
        List<String[]> rows = TsvParserHelper.parseBase64Tsv(base64TSV);
        for(String[] row:rows){
            row[0] =  NormalizeValidateString(row[0],"Barcode");
            NormalizeValidateString(row[1],"Inventory Item Quantity");
        }

       return inventoryUseCase.uploadProductWiseInventory(rows);
    }

    public void addSingleInventorItem(InventoryForm form) {

        normalizeValidateInventory(form);
        InventoryPojo InventoryItem = convertFormToEntity(form);
        inventoryUseCase.addSingleInventoryItem(InventoryItem,form.getBarcode());
    }

    public Page<InventoryData> findInventoryItemByBarcode(InventoryForm form) {

        form.setBarcode(NormalizeValidateString(form.getBarcode(),"Barcode"));
        String barcode = form.getBarcode();

        System.out.println(barcode+" is the normalized barcode ");

        InventoryPojo inventoryPojo = inventoryUseCase.findInventoryItemByBarcode(barcode);
        ProductPojo productPojo = inventoryUseCase.getProductItemByBarcode(barcode);

        InventoryData data = convertEntityToData(inventoryPojo, productPojo);
        if (data == null) {
            return Page.empty();
        }

        return new PageImpl<>(List.of(data));
    }

    public Page<InventoryData> getPagedInventory(PageSizeForm form) {

        Page<InventoryPojo> inventoryPojoPage = inventoryUseCase.getPagedInventory(form.getPage(), form.getSize());
        List<ProductPojo> products = inventoryUseCase.selectExistingProductsWithIds(inventoryPojoPage);

        Map<Long, ProductPojo> productMap =
                products.stream().collect(Collectors.toMap(ProductPojo::getId, p -> p));

        List<InventoryData> dataList = inventoryPojoPage.getContent()
                .stream()
                .map(inv -> convertEntityToData(inv, productMap.get(inv.getProductId())))
                .toList();

        return new PageImpl<>(
                dataList,
                inventoryPojoPage.getPageable(),
                inventoryPojoPage.getTotalElements()
        );
    }

    public void normalizeValidateInventory(InventoryForm form) {
        form.setBarcode(NormalizeValidateString(form.getBarcode(),"Barcode"));
                        NormalizeValidateInteger(form.getQuantity(),"Quantity");

    }
}
