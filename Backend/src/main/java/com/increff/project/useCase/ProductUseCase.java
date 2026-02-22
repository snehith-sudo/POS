package com.increff.project.useCase;

import com.increff.project.api.ClientAPI;
import com.increff.project.api.ProductAPI;
import com.increff.project.entity.ClientPojo;
import com.increff.project.exception.ApiException;
import com.increff.project.entity.ProductPojo;
import com.increff.project.model.data.TsvData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Transactional
@Service
public class ProductUseCase {

    @Autowired
    private ProductAPI productAPI;

    @Autowired
    private ClientAPI clientAPI;

    /* Add a single Product */
    @Transactional(rollbackFor = Exception.class)
    public void addProduct(ProductPojo product,String clientName)  throws ApiException {

        ClientPojo client = clientAPI.getCheckClientByName(clientName);
        if(Objects.isNull(client)){
            throw new ApiException("Client not found with name:"+clientName);
        }
        product.setClientId(client.getId());
        productAPI.addNewProduct(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateProduct(ProductPojo product,String clientName) throws ApiException  {


        ClientPojo client = clientAPI.getCheckClientByName(clientName);
        if (Objects.isNull(client)) {
            throw new ApiException("Invalid clientName: " + clientName);
        }
        product.setClientId(client.getId());

        System.out.println(product);
        productAPI.updateProduct(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductPojo> getAllProductsOfClient(String clientName,int page,int size) {

        ClientPojo client = clientAPI.getCheckClientByName(clientName);
        if(Objects.isNull(client)){
            Pageable pageable = PageRequest.of(page, size);
            return Page.empty(pageable);
        }
        Long clientId = (client).getId();
        return  productAPI.getAllProductsOfClient(clientId,page,size);
    }

    @Transactional(readOnly = true)
    public ProductPojo getProductByBarcode(String barcode){
        return productAPI.getProductByBarcode(barcode);
    }

    @Transactional(readOnly = true)
    public Page<ProductPojo> getPagedProducts(int pageNumber, int pageSize){
        return productAPI.getPagedProducts(pageNumber,pageSize);
    }

    @Transactional(readOnly = true)
    public ClientPojo getClientById(Long id){
        return clientAPI.getClientById(id);
    }

    public List<ClientPojo> selectExistingClientIds(Page<ProductPojo> productPojoPage) {

        List<Long> clientIds = productPojoPage.getContent()
                                  .stream()
                                  .map(ProductPojo::getClientId)
                                  .toList();

        return clientAPI.selectExistingClientWithIds(clientIds);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<TsvData> addMultipleProducts(List<String[]> rows) {

        List<ProductPojo> products = new ArrayList<>();
        Set<String> clientNames = new HashSet<>();
        Set<String> barcodes = new HashSet<>();
        Map<String, String> barcodeToClientMap = new LinkedHashMap<>();

        extractRows(rows, products, clientNames, barcodes, barcodeToClientMap);

        Set<String> existingClientSet = fetchExistingClientNames(clientNames);
        Set<String> existingBarcodeSet = fetchExistingBarcodes(barcodes);

        return validateAndSaveProducts(products, barcodeToClientMap, existingClientSet, existingBarcodeSet);
    }

    private void extractRows(
            List<String[]> rows,
            List<ProductPojo> products,
            Set<String> clientNames,
            Set<String> barcodes,
            Map<String, String> barcodeToClientMap
    ) {
        for (String[] row : rows) {
            String barcode = row[0];
            String name = row[1];
            Double mrp = Double.parseDouble(row[2]);
            String clientName = row[3];
            String imageUrl = row.length > 4 ? row[4] : null;

            ProductPojo product = new ProductPojo();
            product.setBarcode(barcode);
            product.setName(name);
            product.setMrp(mrp);
            product.setImageUrl(imageUrl);

            products.add(product);
            clientNames.add(clientName);
            barcodes.add(barcode);
            barcodeToClientMap.put(barcode, clientName);
        }
    }

    private Set<String> fetchExistingBarcodes(Set<String> barcodes) {
        return productAPI.selectExistingBarcodes(new ArrayList<>(barcodes))
                .stream()
                .map(ProductPojo::getBarcode)
                .collect(Collectors.toSet());
    }
    private Set<String> fetchExistingClientNames(Set<String> clientNames){
        return clientAPI.selectExistingClientNames(clientNames).stream()
                .map(ClientPojo::getName)
                .collect(Collectors.toSet());
    }

    private List<TsvData> validateAndSaveProducts(
            List<ProductPojo> products,
            Map<String, String> barcodeToClientMap,
            Set<String> existingClientSet,
            Set<String> existingBarcodeSet
    ) {
        List<TsvData> results = new ArrayList<>();

        for (ProductPojo product : products) {

            String barcode = product.getBarcode();
            String clientName = barcodeToClientMap.get(barcode);

            if (!existingClientSet.contains(clientName)) {
                results.add(createTsvData(barcode, "Client does not exist: " + clientName));
                continue;
            }

            if (existingBarcodeSet.contains(barcode)) {
                results.add(createTsvData(barcode, "Duplicate barcode"));
                continue;
            }


            Long clientId = clientAPI.getCheckClientByName(clientName).getId();
            // if no client send No client found but clientId will be found here

            product.setClientId(clientId);

            productAPI.addNewProduct(product);

            results.add(createTsvData(barcode, "SUCCESS"));
        }

        return results;
    }

    private TsvData createTsvData(String barcode, String result) {
        TsvData data = new TsvData();
        data.setBarcode(barcode);
        data.setStatus(result);
        return data;
    }
}