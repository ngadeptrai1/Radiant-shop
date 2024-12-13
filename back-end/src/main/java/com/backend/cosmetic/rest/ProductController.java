package com.backend.cosmetic.rest;


import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import com.backend.cosmetic.repository.ProductDetailRepository;
import com.backend.cosmetic.response.ProductResponse;
import com.backend.cosmetic.service.ProductDetailService;
import com.backend.cosmetic.service.ProductService;
import com.google.common.util.concurrent.RateLimiter;

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
private final ProductDetailRepository productDetailRepository;
private static final Logger LOGGER = Logger.getLogger(ProductController.class.getName());
private final RateLimiter rateLimiter = RateLimiter.create(2.0);

    @GetMapping("")
    public ResponseEntity<?> getAllProducts(@RequestParam("page") Optional<Integer> pageNum,
                                            @RequestParam("size") Optional<Integer> size,
                                            @RequestParam("sort") Optional<String> sort,
                                            @RequestParam("direction") Optional<String> direction,
                                            @RequestParam("categories") Optional<List<Integer>> categoryIds,
                                            @RequestParam("brands") Optional<List<Long>> brandIds,
                                            @RequestParam("name") Optional<String> name,
                                            @RequestParam("minPrice") Optional<Double> minPrice,
                                            @RequestParam("maxPrice") Optional<Double> maxPrice) {
        // Default direction to DESC if invalid value is provided
     
        Pageable page = PageRequest.of(pageNum.orElse(0), size.orElse(5));
                
        try {
            return ResponseEntity.status(HttpStatus.OK).body(
                productService.findAll(
                    categoryIds.orElse(null),
                    brandIds.orElse(null),
                    name.orElse(null),
                    minPrice.orElse(null),
                    maxPrice.orElse(null),
                    true,
                    sort.orElse("id"),
                    direction.orElse("DESC"),
                    page
                )
            );
        } catch (Exception e) {
            LOGGER.severe("Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("category/{id}")
    public ResponseEntity<?> findByCateId(@PathVariable Integer id,
                                          @RequestParam("page") Optional<Integer> pageNum,
                                            @RequestParam("size") Optional<Integer> size){
        Pageable page = PageRequest.of(pageNum.orElse(0),size.orElse(5));
        return ResponseEntity.status(HttpStatus.OK)
                .body( productService.findProductsByCategoryAndSubcategories(id,page));
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

    @PutMapping("/product-detail/plus/{id}")
    public ResponseEntity<Integer> plusQuantity(@PathVariable Long id){
        if (!rateLimiter.tryAcquire()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(0);
        }
       
        return ResponseEntity.status(HttpStatus.OK).body( productDetailService.plusQuantity(id));
    }
    @PutMapping("/product-detail/minus/{id}")
    public ResponseEntity<Integer> minusQuantity(@PathVariable Long id){
        if (!rateLimiter.tryAcquire()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(0);
        }
       ;
        return ResponseEntity.status(HttpStatus.OK).body( productDetailService.minusQuantity(id) );
    }
    @PutMapping("/product-detail/refill/{id}")
    public ResponseEntity<?> refillQuantity(@PathVariable Long id, @RequestParam("quantity") int quantity){

        productDetailService.refillQuantity(id, quantity);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
    @PutMapping("/product-detail/minus-in-pos/{id}")
    public ResponseEntity<?> minusInPos(@PathVariable Long id, @RequestParam("quantity") int quantity){
        return ResponseEntity.status(HttpStatus.OK).body(productDetailService.minusInPos(id, quantity));
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

    @GetMapping("/product-details/get-all")
    public ResponseEntity<?> getProductDetails() {
        return ResponseEntity.status(HttpStatus.OK).body(productDetailRepository.findAllProductDetails());
    }

    @GetMapping("/{id}/product-details")
    public ResponseEntity<?> findProductDetails(@PathVariable Long id) {
        return ResponseEntity.ok(productDetailService.findByProductId(id));
    }
}
