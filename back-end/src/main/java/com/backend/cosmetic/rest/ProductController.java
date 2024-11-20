package com.backend.cosmetic.rest;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.ProductDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.response.ProductResponse;
import com.backend.cosmetic.service.ProductDetailService;
import com.backend.cosmetic.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("api/v1/products")
@RequiredArgsConstructor
public class ProductController {

private final ProductService productService;
private final ProductDetailService productDetailService;
private static final Logger LOGGER = Logger.getLogger(ProductController.class.getName());

    @GetMapping("")
    public ResponseEntity<?> getAllProducts(@RequestParam("page") Optional<Integer> pageNum,
                                            @RequestParam("size") Optional<Integer> size,
                                            @RequestParam("sort") Optional<String> sort,
                                            @RequestParam("direction") Optional<String> direction,
                                            @RequestParam("category") Optional<String> category,
                                            @RequestParam("brand") Optional<String> brand,
                                            @RequestParam("name") Optional<String> name,
                                            @RequestParam("minPrice") Optional<Double> minPrice,
                                            @RequestParam("maxPrice") Optional<Double> maxPrice) {
        Map<String, Object> filterCriteria = new HashMap<>();
        category.ifPresent(value -> filterCriteria.put("category", value));
        brand.ifPresent(value -> filterCriteria.put("brand", value));
        name.ifPresent(value -> filterCriteria.put("name", value));
        minPrice.ifPresent(value -> filterCriteria.put("minPrice", value));
        maxPrice.ifPresent(value -> filterCriteria.put("maxPrice", value));
        // Default direction to DESC if invalid value is provided
        Sort.Direction sortDirection;
        try {
            sortDirection = Sort.Direction.fromString(direction.orElse("DESC"));
        } catch (IllegalArgumentException e) {
            sortDirection = Sort.Direction.DESC;
        }
        Pageable page = PageRequest.of(pageNum.orElse(0), size.orElse(5),
                Sort.by(sortDirection, sort.orElse("id")));
        try {
            return ResponseEntity.status(HttpStatus.OK).body(productService.findAll(filterCriteria,page));
        } catch (Exception e) {
            LOGGER.severe("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("get-all")
    public ResponseEntity<?> getAll() {

        try {
            return ResponseEntity.status(HttpStatus.OK).body(productService.getAllProducts());
        } catch (Exception e) {
            LOGGER.severe("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK)
                .body( productService.findById(id));
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProduct(@Valid @ModelAttribute ProductDTO product
            , BindingResult result){
        try {
            if(result.hasErrors()){
                List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            }
            System.out.println(product);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productService.saveProduct(product));
        }
        catch (Exception ex){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Something went wrong, please try again: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @Valid @RequestBody ProductDTO product,
            BindingResult result,
            @PathVariable Long id ){
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException( errs.isEmpty() ? "" : errs.get(0));
        }
        System.out.println(product);
        return ResponseEntity.status(HttpStatus.OK)
                .body(productService.updateProduct(product,id));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK).body(productService.deleteProduct(id));
    }

    @PutMapping("/product-detail/{id}/quantity/{type}")
    public ResponseEntity<?> updateQuantityByOne(
            @PathVariable Long id,
            @PathVariable String type) {
        try {
            return ResponseEntity.ok(productDetailService.updateQuantityByOne(id, type));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/product-detail/{id}/quantity/amount/{amount}")
    public ResponseEntity<?> updateQuantityByAmount(
            @PathVariable Long id,
            @PathVariable int amount) {
        try {
            return ResponseEntity.ok(productDetailService.updateQuantityByAmount(id, amount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String name) {
        try {
            List<ProductResponse> products = productService.searchProductsByName(name);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    

}
