package com.increff.project.dao;

import com.increff.project.entity.ProductPojo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProductDAO extends AbstractDAO<ProductPojo> {

    // ---------- JPQL QUERIES ----------
    private static final String FIND_BY_IDS =
            "SELECT p FROM ProductPojo p WHERE p.id IN :ids";

    private static final String FIND_BY_BARCODES =
            "SELECT p FROM ProductPojo p WHERE p.barcode IN :codes";

    private static final String FIND_BY_CLIENT_ID =
            "SELECT e FROM ProductPojo e WHERE e.clientId = :clientId";

    private static final String COUNT_BY_CLIENT_ID =
            "SELECT COUNT(e) FROM ProductPojo e WHERE e.clientId = :clientId";

    private static final String FIND_BY_BARCODE =
            "SELECT e FROM ProductPojo e WHERE e.barcode = :barcode";
    // ----------------------------------

    public ProductDAO() {
        super(ProductPojo.class);
    }

    public void addNewProduct(ProductPojo product){
        addNewEntity(product);
    }

    public void updateProduct(ProductPojo product){
        update(product);
    }

    public List<ProductPojo> getExistingProductBarcodesFromInventoryProductIds(List<Long> inventoryProductIds) {

        return em.createQuery(FIND_BY_IDS, ProductPojo.class)
                .setParameter("ids", inventoryProductIds)
                .getResultList();
    }

    public List<ProductPojo> getExistingBarcodes(List<String> barcodes) {
        return em.createQuery(FIND_BY_BARCODES, ProductPojo.class)
                .setParameter("codes", barcodes)
                .getResultList();
    }

    public List<ProductPojo> getPagedProducts(Integer pageNumber, Integer pageSize) {
        return selectPaged(pageNumber * pageSize, pageSize, "name");
    }

    public long getCountOfTotalProducts() {
        return countAllRowsInTable();
    }

    public List<ProductPojo> getExistingProductsWithIds(List<Long> productIds){
        return selectExistingEntityWithIds(productIds);
    }

    public List<ProductPojo> getAllProductsOfClient(Long clientId, Integer page, Integer size) {

        return em.createQuery(FIND_BY_CLIENT_ID, ProductPojo.class)
                .setParameter("clientId", clientId)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();
    }

    public long getTotalProductsCountByClientId(Long clientId){

        return em.createQuery(COUNT_BY_CLIENT_ID, Long.class)
                .setParameter("clientId", clientId)
                .getSingleResult();
    }

    public ProductPojo getProductByBarcode(String barcode) {

        List<ProductPojo> result = em.createQuery(FIND_BY_BARCODE, ProductPojo.class)
                .setParameter("barcode", barcode)
                .getResultList();

        return result.isEmpty() ? null : result.get(0);
    }
}
