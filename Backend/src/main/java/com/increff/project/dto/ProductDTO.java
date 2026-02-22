package com.increff.project.dto;


import java.util.*;
import java.util.stream.Collectors;

import com.increff.project.model.data.TsvData;
import com.increff.project.model.form.PageSizeForm;
import com.increff.project.useCase.ProductUseCase;
import com.increff.project.utils.helpers.TsvParserHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import com.increff.project.entity.ClientPojo;
import com.increff.project.entity.ProductPojo;
import com.increff.project.model.data.ProductData;
import com.increff.project.model.form.ProductFilterForm;
import com.increff.project.model.form.ProductForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.utils.helpers.AbstractValidateNormalize;

import static com.increff.project.utils.helpers.ProductHelper.convertFormToEntity;
import com.increff.project.utils.utils.ProductUtil;
import static com.increff.project.utils.utils.ProductUtil.convertProductEntityToData;

@Component
public class ProductDTO extends AbstractValidateNormalize {

    @Autowired
    private ProductUseCase productUseCase;

    public void addProduct(ProductForm form) {

        validateNormalizeProducts(form);
        ProductPojo newproduct = convertFormToEntity(form);
        productUseCase.addProduct(newproduct,form.getClientName());
    }

    public void updateProduct(ProductForm form){

        validateNormalizeProducts(form);
        ProductPojo updatedproduct = convertFormToEntity(form);
         updatedproduct.setVersion(form.getVersion());
        productUseCase.updateProduct(updatedproduct,form.getClientName());
    }

    public List<ProductData> getProductByBarcode(ProductFilterForm form) {

        form.setBarcode(NormalizeValidateString(form.getBarcode(),"Barcode"));

        ProductPojo product = productUseCase.getProductByBarcode(form.getBarcode());

        if(Objects.isNull(product)){
            return Collections.emptyList();
        }
        Long clientId = product.getClientId();
        String clientName = productUseCase.getClientById(clientId).getName();

        return List.of(convertProductEntityToData(product,clientName));
    }

    public Page<ProductData> getAllProductsOfClient(ProductFilterForm form) {

        String clientName = form.getClientName();
        form.setClientName(NormalizeValidateString(clientName,"Client Name"));

        Page<ProductPojo> productPojoPage =
                productUseCase.getAllProductsOfClient(
                        clientName,
                        form.getPage(),
                        form.getSize()
                );

        List<ProductData> dataList = productPojoPage.getContent()
                .stream()
                .map(product ->ProductUtil.convertProductEntityToData(product, clientName))
                .toList();

        return new PageImpl<>(
                dataList,
                productPojoPage.getPageable(),
                productPojoPage.getTotalElements()
        );
    }


    public Page<ProductData> getPagedProducts(PageSizeForm form) {

        Page<ProductPojo> productPojoPage = productUseCase.getPagedProducts(form.getPage(), form.getSize());
        List<ClientPojo> clients = productUseCase.selectExistingClientIds(productPojoPage);

        Map<Long, String>
                clientIdToName = clients.stream()
                                 .collect(Collectors.toMap(ClientPojo::getId, ClientPojo::getName));

        List<ProductData> dataList = productPojoPage.getContent()
                .stream()
                .map(productPojo -> {
                    String clientName = clientIdToName.get(productPojo.getClientId());
                    return convertProductEntityToData(productPojo,clientName);
                })
                .collect(Collectors.toList());


        return new PageImpl<>(
                dataList,
                productPojoPage.getPageable(),
                productPojoPage.getTotalElements()
        );
    }

    //TODO multipart files
    public List<TsvData> addMultipleProduct(TsvForm form) {

        String base64TSV = form.getBase64file();
        List<String[]> rows = TsvParserHelper.parseBase64Tsv(base64TSV);

        for(String[] row:rows){
           row[0] =  NormalizeValidateString(row[0],"Barcode");
           row[3] = NormalizeValidateString(row[3],"Client Name");
        }

       return productUseCase.addMultipleProducts(rows);
    }

    private void validateNormalizeProducts(ProductForm form) {
        form.setBarcode(NormalizeValidateString(form.getBarcode(),"Barcode"));
        form.setClientName(NormalizeValidateString(form.getClientName(),"Client Name"));
        form.setMrp(NormalizeValidateDouble(form.getMrp(),"Product Mrp"));
    }
}
