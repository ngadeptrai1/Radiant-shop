package com.backend.cosmetic.rest;


import java.util.List;

import com.backend.cosmetic.exception.DataNotFoundException;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.CategoryDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.repository.CategoryRepository;
import com.backend.cosmetic.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/categories")
@CacheConfig(cacheNames = "categories")
public class CategoryController {
    private final CategoryService categoryService;
    private final CategoryRepository categoryRepository;

    @GetMapping({"","/"})
    @Cacheable
    public ResponseEntity<?> getAll(){
        try {
            return ResponseEntity.status(HttpStatus.OK).body(categoryRepository.findAll());
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("parents")
    @Cacheable(value = "parentCategories")
    public ResponseEntity<?> getAllParents(){
        try {
            return ResponseEntity.status(HttpStatus.OK).body(categoryService.findAllParents());
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping({"","/"})
    @CacheEvict(value = {"categories", "parentCategories"}, allEntries = true)
    public ResponseEntity<?> insert( @Valid @RequestBody CategoryDTO category ,
                                    BindingResult result){
        System.out.println("cate" + category);
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException( errs.isEmpty() ? "" : errs.get(0));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.save(category));
    }
    @PutMapping("/{id}")
    @CacheEvict(value = {"categories", "parentCategories"}, allEntries = true)
    public ResponseEntity<?> update( @PathVariable int id,
                                    @Valid @RequestBody CategoryDTO updateCate ,
                                    BindingResult result){

        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException( errs.isEmpty() ? "" : errs.get(0));
        }
        return ResponseEntity.status(HttpStatus.OK).body(categoryService.update(id,updateCate));
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable int id){
        return ResponseEntity.status(HttpStatus.FOUND).body(categoryRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("Category not found")
        ));
    }
    @DeleteMapping("/{id}")
    @CacheEvict(value = {"categories", "parentCategories"}, allEntries = true)
    public ResponseEntity<?> delete( @PathVariable int id){
        return ResponseEntity.status(HttpStatus.OK).body(categoryService.delete(id));
    }
    @GetMapping("/get-all")
    public ResponseEntity<?> findParentCategoryById(){
        return ResponseEntity.status(HttpStatus.OK).body(categoryService.findAll());
    }
}
