package com.increff.project.api;

import com.increff.project.dao.ProductDAO;
import com.increff.project.exception.ApiException;
import com.increff.project.entity.ProductPojo;
import org.springframework.beans.factory.annotation.Autowired;
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
    public void addProduct(ProductPojo product){productdao.addProduct(product);}

    @Transactional(rollbackFor = Exception.class)
    public void updateProduct(ProductPojo product)
    {
        ProductPojo entity = getByBarcode(product.getBarcode());
        if(Objects.isNull(entity))
        {
            throw new ApiException("ProductId does not exist in Database for barcode:"+product.getBarcode());
        }
        product.setId(entity.getId());
        productdao.updateProduct(product);
    }

    @Transactional(readOnly = true)
     public ProductPojo findByProductId(int id)
     {
         ProductPojo product = productdao.findByProductId(id);
         if(Objects.isNull(product)){
             throw new ApiException("Product is not present with productId "+id);
         }
         return product;
     }

    @Transactional(readOnly = true)
     public boolean existByProductId(int id){return productdao.existByProductId(id);}

    @Transactional(readOnly = true)
    public ProductPojo getByBarcode(String barcode)
    {
        ProductPojo entity = productdao.findByBarcode(barcode);
        if(Objects.isNull(entity)) {
            throw new ApiException("Invalid barcode : " + barcode);
        }
        return entity;
    }

    @Transactional(readOnly = true)
    public List<ProductPojo> getAllClientProducts(int clientId)
    {return productdao.getAllClientProducts(clientId);}

    @Transactional(readOnly = true)
    public List<Object[]> selectExistingBarcodes(List<String> barcodes){
        return productdao.selectExistingBarcodes(barcodes);
    }

    @Transactional(readOnly = true)
    public List<String > selectExistingBarcodesFromProductId(List<Integer> InventoryProductids)
    {return productdao.selectExistingBarcodesFromProductId(InventoryProductids);}

    @Transactional(readOnly = true)
     public List<ProductPojo> getAllProductsPaginated(int page, int size)
     {return productdao.selectAllPaginatedProducts(page, size);}

    @Transactional(readOnly = true)
     public List<ProductPojo> getAllProducts()
     {return productdao.selectAllProducts();}

}
