package com.backend.cosmetic.rest;

import com.backend.cosmetic.dto.ColorDTO;
import com.backend.cosmetic.dto.ProductDetailDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.model.ProductDetail;
import com.backend.cosmetic.service.ColorService;
import com.backend.cosmetic.service.ProductDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/product-details")
public class ProductDetailController {
    private ProductDetailService productDetailService;


    @PostMapping({"","/"})
    public ResponseEntity<?> create(@Valid @RequestBody ProductDetailDTO productDetailDTO, BindingResult result) {


        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            String mess = errs.isEmpty() ? "" : errs.get(0);;
            throw new DataInvalidException( mess);
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(productDetailService.save(productDetailDTO));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@Valid @RequestBody ProductDetailDTO productDetailDTO,
                                    BindingResult result,
                                    @PathVariable Long id){
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException( errs.isEmpty() ? "" : errs.get(0));
        }
        return ResponseEntity.status(HttpStatus.OK).body(productDetailService.update(productDetailDTO,id));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK).body(productDetailService.delete(id));
    }


}
