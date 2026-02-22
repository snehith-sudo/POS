package com.increff.project.controller;

import com.increff.project.model.data.ProductData;
import com.increff.project.dto.ProductDTO;
import com.increff.project.model.data.TsvData;
import com.increff.project.model.form.ProductFilterForm;
import com.increff.project.model.form.ProductForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.model.form.PageSizeForm;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {

   @Autowired
   private  ProductDTO productDTO;

   /* -------- CREATE -------- */
   @RequestMapping(method = RequestMethod.POST)
   @ResponseStatus(HttpStatus.CREATED)
   public void addProduct(@Valid @RequestBody ProductForm form) {
      productDTO.addProduct(form);
   }

   /* -------- UPDATE -------- */
   @RequestMapping(method = RequestMethod.PUT)
   @ResponseStatus(HttpStatus.CREATED)
   public void updateProduct(@Valid @RequestBody ProductForm form) {
      productDTO.updateProduct(form);
   }

   /* -------- UPLOAD -------- */
   @RequestMapping(method = RequestMethod.POST, path = "/uploadForm")
   public List<TsvData> addMultipleProducts(@RequestBody TsvForm form)
   {
     return productDTO.addMultipleProduct(form);
   }

   @RequestMapping(method = RequestMethod.POST, path = "/pages")
   public Page<ProductData> getAllProductsPaginated(@RequestBody PageSizeForm form) {
      return productDTO.getPagedProducts(form);
   }

   @RequestMapping(method = RequestMethod.POST,path = "/barcode")
   public List<ProductData> getProductByBarcode(@RequestBody ProductFilterForm form) {
      System.out.println(form);
      return productDTO.getProductByBarcode(form);
   }

   @RequestMapping(method = RequestMethod.POST,path = "/clientName")
   public Page<ProductData> getAllProductsOfClient(@RequestBody ProductFilterForm form) {
      return productDTO.getAllProductsOfClient(form);
   }

}