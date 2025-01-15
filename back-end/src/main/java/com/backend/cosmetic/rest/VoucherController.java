package com.backend.cosmetic.rest;

import com.backend.cosmetic.dto.VoucherDTO;

import com.backend.cosmetic.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody VoucherDTO voucherDTO ) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(voucherService.save(voucherDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucher(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.findById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAllVouchers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println(authentication.getPrincipal());
        System.out.println(authentication);
        System.out.println("Authorities: " + authentication.getAuthorities());
        return ResponseEntity.ok(voucherService.findAll());
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody VoucherDTO voucherDTO
            ,@AuthenticationPrincipal String jwt) {
        System.out.println(jwt);
        return ResponseEntity.ok(voucherService.update(id, voucherDTO));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
       return  ResponseEntity.ok(voucherService.delete(id));
    }

    @GetMapping("/apply")


    public ResponseEntity<?> applyCode(@RequestParam("code") String code, @RequestParam("totalAmount") long totalAmount) {
        return ResponseEntity.ok(voucherService.applyCode(code, totalAmount));
    }

    @GetMapping("/valid")
    public ResponseEntity<?> getValidVouchers(@RequestParam("amount") long amount) {
        return ResponseEntity.ok(voucherService.findValidVouchersByAmount(amount));
    }

    @GetMapping("/active")
    public ResponseEntity<?> getAllActiveVouchers() {
        return ResponseEntity.ok(voucherService.findAllActiveVouchers());
    }

}
