package com.increff.project.api;

import com.increff.project.dao.ProductDAO;
import com.increff.project.exception.ApiException;
import com.increff.project.entity.ProductPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class ProductAPI {

    @Autowired
    private ProductDAO productdao;

    @Transactional(rollbackFor = Exception.class)
    public void addNewProduct(ProductPojo product) throws ApiException {

        ProductPojo isBarcodeExists = productdao.getProductByBarcode(product.getBarcode());
        if(!Objects.isNull(isBarcodeExists)){
            throw new ApiException("Duplicate Entry for barcode:"
                    + product.getBarcode());
        }
        productdao.addNewProduct(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateProduct(ProductPojo product) throws ApiException  {

        ProductPojo entity = getProductByBarcode(product.getBarcode());
        if(Objects.isNull(entity)) {
            throw new ApiException("ProductId does not exist in Database for barcode:"
                                  + product.getBarcode());
        }
        ProductPojo isBarcodeExists = productdao.getProductByBarcode(product.getBarcode());
        if(Objects.isNull(isBarcodeExists)){
            throw new ApiException("Barcode does not exist in database:"
                    + product.getBarcode());
        }

        product.setId(entity.getId());
        productdao.updateProduct(product);
    }

    public List<ProductPojo> selectExistingProductsWithIds(List<Long> productIds){
        return productdao.getExistingProductsWithIds(productIds);
    }

    @Transactional(readOnly = true)
    public ProductPojo getProductByBarcode(String barcode) {

        ProductPojo entity = productdao.getProductByBarcode(barcode);
        if(Objects.isNull(entity)) {
            return null;
        }
        return entity;
    }

    @Transactional(readOnly = true)
    public Page<ProductPojo> getAllProductsOfClient(Long clientId,Integer page,Integer size) {

        List<ProductPojo> products = productdao.getAllProductsOfClient(clientId,page,size);
        long totalElements = productdao.getTotalProductsCountByClientId(clientId);

        PageRequest pageRequest = PageRequest.of(page,size);
        return new PageImpl<>(products, pageRequest, totalElements);
    }

    @Transactional(readOnly = true)
    public List<ProductPojo> selectExistingBarcodes(List<String> barcodes){
        return productdao.getExistingBarcodes(barcodes);
    }

    @Transactional(readOnly = true)
    public List<ProductPojo > selectExistingBarcodesFromProductId(List<Long> InventoryProductids) {
        return productdao.getExistingProductBarcodesFromInventoryProductIds(InventoryProductids);
    }

    @Transactional(readOnly = true)
    public Page<ProductPojo> getPagedProducts(Integer pageNumber, Integer pageSize) {
        List<ProductPojo> products = productdao.getPagedProducts(pageNumber, pageSize);
        long totalElements = productdao.getCountOfTotalProducts();

        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize);
        return new PageImpl<>(products, pageRequest, totalElements);
    }

}
