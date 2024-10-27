package com.backend.cosmetic.rest;


import com.backend.cosmetic.dto.ProductDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("api/v1/products")
@RequiredArgsConstructor
public class ProductController {

private final ProductService productService;
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
                throw new DataInvalidException(errs.isEmpty() ? "" : errs.get(0));
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productService.saveProduct(product));
        }
        catch (IOException ex){
            return  ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Some thing went wrong , please try again ");
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
        return ResponseEntity.status(HttpStatus.OK)
                .body(productService.updateProduct(product,id));
    }
}
