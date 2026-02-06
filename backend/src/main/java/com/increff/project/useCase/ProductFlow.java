package com.increff.project.useCase;

import com.increff.project.api.ClientAPI;
import com.increff.project.api.ProductAPI;
import com.increff.project.exception.ApiException;
import com.increff.project.model.helpers.TsvParserHelper;
import com.increff.project.entity.ProductPojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
public class ProductFlow {

    @Autowired
    private ProductAPI productAPI;

    @Autowired
    private ClientAPI clientAPI;

    /* Add a single Product */
    @Transactional(rollbackFor = Exception.class)
    public void addProduct(ProductPojo product) {

        if (!clientAPI.existClientById(product.getClientId())) {
            throw new ApiException("Invalid clientId: " + product.getClientId());
        }
        productAPI.addProduct(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateProduct(ProductPojo product)
    {

        if (!clientAPI.existClientById(product.getClientId())) {
            throw new ApiException("Invalid clientId: " + product.getClientId());
        }
        productAPI.updateProduct(product);
    }

    @Transactional(readOnly = true)
    public List<ProductPojo> getAllClientProducts(String clientName)
    {
        int clientId = (clientAPI.findClientByName(clientName)).getId();
        return  productAPI.getAllClientProducts(clientId);
    }

    @Transactional(readOnly = true)
    public ProductPojo findByBarcode(String barcode){return productAPI.getByBarcode(barcode);}

    @Transactional(readOnly = true)
    public List<ProductPojo> getAll(){return productAPI.getAllProducts();}

    @Transactional(readOnly = true)
    public List<ProductPojo> getAllPaginated(int page, int size)
    {return productAPI.getAllProductsPaginated(page,size);}

    @Transactional(rollbackFor = Exception.class)
    public Map<String,String> addMultipleProducts(String base64Tsv)
    {
        List<String[]> rows = TsvParserHelper.parseBase64Tsv(base64Tsv);
        Map<String, String> results = new LinkedHashMap<>();

        if (rows.isEmpty()) {throw new ApiException("TSV file is empty");}

        List<ProductPojo> products = new ArrayList<>();
        Set<Integer> clientIds = new HashSet<>();
        Set<String> barcodes = new HashSet<>();

        /* 2. Convert rows → entities */
        for (String[] row : rows)
        {

            if (row.length != 4 && row.length != 5) {
                throw new ApiException("Invalid TSV format. Expected 4 or 5 columns.");
            }

            String barcode = row[0].trim();
            String name    = row[1].trim();
            double mrp     = Double.parseDouble(row[2].trim());
            int clientId   = Integer.parseInt(row[3].trim());
            String imageUrl = row.length > 4 ? row[4].trim() : null;

            ProductPojo product = new ProductPojo();
            product.setBarcode(barcode);
            product.setClientId(clientId);
            product.setName(name);
            product.setMrp(mrp);
            product.setImageUrl(imageUrl);

            products.add(product);
            clientIds.add(clientId);
            barcodes.add(barcode);
        }

        /* 3. Validate clientIds (ONE DB call) */
        List<Integer> existingClientIds = clientAPI.getExistingClientIds(clientIds);
        Set<Integer> existingClientSet = new HashSet<>(existingClientIds);

        /* 4. Validate barcode uniqueness (ONE DB call) */
        List<Object[]> ProductIdBarcodes = productAPI.selectExistingBarcodes(new ArrayList<>(barcodes));

        Set<String> existingBarcodeSet = ProductIdBarcodes.stream()
                .map(row -> (String) row[0])
                .collect(Collectors.toSet());

        /* 5. Persist products */
        for (ProductPojo product : products)
        {
            if (!existingClientSet.contains(product.getClientId()))
            {
                results.put(product.getBarcode(), "Client does not exist");
                continue;
            }

            if (existingBarcodeSet.contains(product.getBarcode()))
            {
                results.put(product.getBarcode(), "Duplicate barcode");
                continue;
            }

            productAPI.addProduct(product);
            results.put(product.getBarcode(), "SUCCESS");
        }
        return results;
    }
}
