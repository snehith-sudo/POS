package com.increff.project.dto;

import com.increff.project.model.form.ProductFilterForm;
import com.increff.project.model.data.ProductData;
import com.increff.project.model.helpers.PageSizeHelper;
import com.increff.project.useCase.ProductFlow;
import com.increff.project.model.form.ProductForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.model.helpers.AbstractValidateNormalize;
import com.increff.project.entity.ProductPojo;
import com.increff.project.model.utils.ProductUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import static com.increff.project.model.utils.ProductUtil.convertProductEntitytoForm;
import static com.increff.project.model.helpers.ProductHelper.convertFormToEntity;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ProductDTO extends AbstractValidateNormalize {

    @Autowired
    private ProductFlow productFlow;

    /* ---------------- CREATE ---------------- */
    public void addProduct(ProductForm form)
    {
        validateNormalizeProducts(form);
        ProductPojo newproduct = convertFormToEntity(form);
        productFlow.addProduct(newproduct);
    }

    public void updateProduct(ProductForm form){
        validateNormalizeProducts(form);
        ProductPojo updatedproduct = convertFormToEntity(form);
        productFlow.updateProduct(updatedproduct);
    }

    public ProductData findByBarcode(ProductFilterForm form)
    {
        return convertProductEntitytoForm((productFlow.findByBarcode(form.getBarcode())));
    }

    public List<ProductData> getAllClientProducts(ProductFilterForm form) {
        List<ProductPojo> data =
                productFlow.getAllClientProducts(form.getClientName());

        return data.stream()
                .map(ProductUtil::convertProductEntitytoForm)
                .collect(Collectors.toList());
    }


    public Map<String, String> addMultipleProduct(TsvForm form)
    {
       return productFlow.addMultipleProducts(form.getBase64file());
    }

    /* ---------------- READ ---------------- */

    public List<ProductData> getAll() {
        return productFlow.getAll()
                .stream()
                .map(ProductUtil::convertProductEntitytoForm)
                .collect(Collectors.toList());
    }

    public List<ProductData> getAllPaginated(PageSizeHelper form)
    {
        validateNormalizeInteger(form.getPage(),"Page Number");
        validateNormalizeInteger(form.getSize(),"Size of data");
        return productFlow.getAllPaginated(form.getPage(),form.getSize())
                .stream()
                .map(ProductUtil::convertProductEntitytoForm)
                .collect(Collectors.toList());
    }

    public void validateNormalizeProducts(ProductForm form)
    {
        validateNormalizeString(form.getBarcode(),"Barcode");
        validateNormalizeString(form.getImageUrl(),"Image Url");
        validateNormalizeString(form.getName(),"Product Name");
        validateNormalizeInteger(form.getClientId(),"Client Id");
        validateNormalizeDouble(form.getMrp(),"Product Mrp");
    }

}
