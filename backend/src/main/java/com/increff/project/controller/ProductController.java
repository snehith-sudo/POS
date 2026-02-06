package com.increff.project.controller;

import com.increff.project.model.data.ProductData;
import com.increff.project.dto.ProductDTO;
import com.increff.project.model.form.ProductFilterForm;
import com.increff.project.model.form.ProductForm;
import com.increff.project.model.form.TsvForm;
import com.increff.project.model.helpers.PageSizeHelper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:3000")
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
   // Note: Kept as POST because your original code used @PostMapping("/update")
   @RequestMapping(method = RequestMethod.PUT, path = "/update")
   @ResponseStatus(HttpStatus.ACCEPTED)
   public void updateProduct(@Valid @RequestBody ProductForm form) {
      productDTO.updateProduct(form);
   }

   /* -------- UPLOAD -------- */
   @RequestMapping(method = RequestMethod.POST, path = "/uploadForm")
   public Map<String, String> addMultipleProducts(@RequestBody TsvForm form)
   {
     return productDTO.addMultipleProduct(form);
   }

   /* -------- READ (PAGINATED) -------- */
   @RequestMapping(method = RequestMethod.POST,path = "/pages")
   public List<ProductData> getProducts(@RequestBody PageSizeHelper form) {
      return productDTO.getAllPaginated(form);
   }

   @RequestMapping(method = RequestMethod.POST,path = "/barcode")
   public ProductData getByBarcode(@RequestBody ProductFilterForm form) {
      return productDTO.findByBarcode(form);
   }

   @RequestMapping(method = RequestMethod.POST,path = "/client")
   public List<ProductData> getAllClientProducts(@RequestBody ProductFilterForm form) {
      return productDTO.getAllClientProducts(form);
   }


   /* -------- READ ALL -------- */
   @RequestMapping(method = RequestMethod.GET, path = "/allProducts")
   public List<ProductData> getAllProducts() {
      return productDTO.getAll();
   }
}