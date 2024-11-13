package com.backend.cosmetic.rest;


import com.backend.cosmetic.dto.CategoryDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping({"","/"})
    public ResponseEntity<?> getAll(){
        try {
            return ResponseEntity.status(HttpStatus.OK).body(categoryService.findAll());
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping({"","/"})
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
        return ResponseEntity.status(HttpStatus.FOUND).body(categoryService.findById(id));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete( @PathVariable int id){
        return ResponseEntity.status(HttpStatus.OK).body(categoryService.delete(id));
    }

}
