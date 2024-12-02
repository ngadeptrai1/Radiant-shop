package com.backend.cosmetic.controller;

import java.util.List;

import com.backend.cosmetic.model.UserAddress;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.UserAddressDTO;
import com.backend.cosmetic.service.UserAddressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/user-address")
@RequiredArgsConstructor
public class UserAddressController {
    private final UserAddressService userAddressService;

    @PostMapping("user/{id}")
    public ResponseEntity<UserAddress> createAddress(@PathVariable("id") Long id ,
                                                     @RequestBody UserAddressDTO addressDTO) {

        return ResponseEntity.ok(userAddressService.createAddress(addressDTO , id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAddress>> getUserAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(userAddressService.getUserAddresses(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserAddress> updateAddress(
            @PathVariable Long id,
            @RequestBody UserAddressDTO addressDTO) {
        return ResponseEntity.ok(userAddressService.updateAddress(id, addressDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        userAddressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
} 