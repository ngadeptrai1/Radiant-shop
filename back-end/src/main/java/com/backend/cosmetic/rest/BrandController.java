package com.backend.cosmetic.rest;

import com.backend.cosmetic.dto.BrandDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.service.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.attribute.UserPrincipal;
import java.security.Principal;
import java.util.List;
import java.util.Optional;


@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/brands")
public class BrandController {
    private final BrandService brandService;

    @GetMapping({"","/"})
    public ResponseEntity<?> findAll(){
        try {

            return ResponseEntity.status(HttpStatus.OK).body(brandService.findAll());
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findOne(@PathVariable int id){
        return ResponseEntity.status(HttpStatus.FOUND).body(brandService.findById(id));
    }

    @PostMapping(value = {"","/"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@Valid @ModelAttribute BrandDTO brand ,
                                    BindingResult result){

        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            String mess = errs.isEmpty() ? "" : errs.get(0);
            System.out.println(mess);
            throw new DataInvalidException( mess);
        }
        try {
            System.out.println(brand.toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(brandService.save(brand));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @PutMapping(value = "/{id}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(@Valid @ModelAttribute BrandDTO updateBrand ,
                                    BindingResult result,
                                    @PathVariable Integer id){
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException( errs.isEmpty() ? "" : errs.get(0));
        }
        return ResponseEntity.status(HttpStatus.OK).body(brandService.update(id ,updateBrand));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id){
        return ResponseEntity.ok().body(brandService.delete(id));
    }



}
