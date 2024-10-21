package com.backend.cosmetic.rest;

import com.backend.cosmetic.dto.BrandDTO;
import com.backend.cosmetic.dto.ColorDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.service.ColorService;
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
@RequestMapping("api/v1/color")
public class ColorController {
    private ColorService colorService;

    @Autowired
    public ColorController(ColorService colorService) {
        this.colorService = colorService;
    }

    @GetMapping({"", "/"})
    public ResponseEntity<?> findAll(@RequestParam("page") Optional<Integer> pageNum,
                                     @RequestParam("size") Optional<Integer> size,
                                     @RequestParam("sort") Optional<String> sort) {
        Pageable page = PageRequest.of(pageNum.orElse(0), size.orElse(5), Sort.by(sort.orElse("id")).descending());
        try {
            return ResponseEntity.status(HttpStatus.OK).body(colorService.findAll(page));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping({"","/"})
    public ResponseEntity<?> create(@Valid @RequestBody ColorDTO colorDTO ,
                                    BindingResult result){

        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            String mess = errs.isEmpty() ? "" : errs.get(0);;
            throw new DataInvalidException( mess);
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(colorService.save(colorDTO));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@Valid @RequestBody ColorDTO colorDTO ,
                                    BindingResult result,
                                    @PathVariable Integer id){
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException( errs.isEmpty() ? "" : errs.get(0));
        }
        return ResponseEntity.status(HttpStatus.OK).body(colorService.update(id ,colorDTO));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        return ResponseEntity.ok().body("ok");
    }


}
