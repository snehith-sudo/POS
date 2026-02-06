package com.increff.project.dao;


import com.increff.project.entity.ProductPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProductDAO extends AbstractDAO<ProductPojo> {

    /* Constructor to save the entity */
    public ProductDAO() {super(ProductPojo.class);}

    /* Adding a New Product */
    public void addProduct(ProductPojo product){insert(product);}

    /* Updating a new Product */
    public void updateProduct(ProductPojo product){update(product);}

    /* Finding a Product By id */
    public ProductPojo findByProductId(Integer id){return findById(id);}

    /* checking product and returning boolean*/
    public boolean existByProductId(Integer id){return existsById(id);}

    /* Find for multiple ids */
    public List<Integer> selectExistingProductIds(List<Integer> productIds) {
        return selectmultipleExistingIds(productIds);
    }

    public List<String> selectExistingBarcodesFromProductId(List<Integer> InventoryProductids)
    {
        return em.createQuery("SELECT p.barcode FROM ProductPojo p WHERE p.id IN :ids",String.class)
                .setParameter("ids",InventoryProductids)
                .getResultList();
    }

    public List<Object[]> selectExistingBarcodes(List<String> barcodes) {
        return em.createQuery(
                        "SELECT p.barcode,p.id FROM ProductPojo p WHERE p.barcode IN :codes",
                        Object[].class
                ).setParameter("codes", barcodes)
                .getResultList();
    }

    /* Finding all Client Products */
    public List<ProductPojo> getAllClientProducts(int clientId)
    {return findByClientId(clientId);}

    /*  Finding by Barcode  */
    public ProductPojo findByBarcode(String barcode) {
        return findByBarcode("barcode", barcode);
    }

    public boolean existsByBarcode(String barcode) {
        return existsByField("barcode", barcode.toLowerCase());
    }

    /*  Getting All products with Pagination */
    public List<ProductPojo> selectAllProducts() {
        return selectAll();
    }

    /*  Getting All products without Pagination */
    public List<ProductPojo> selectAllPaginatedProducts(int page, int size) {
        return selectAllPaginated(page, size);
    }

}
