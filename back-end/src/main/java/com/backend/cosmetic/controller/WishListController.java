package com.backend.cosmetic.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.WishListDto;
import com.backend.cosmetic.repository.WishListRepository;
import com.backend.cosmetic.service.WishListService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishListController {
    private final WishListService wishListService;
    private final WishListRepository wishListRepository;
    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<WishListDto> addToWishList(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishListService.addToWishList(userId, productId));
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeFromWishList(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        wishListService.removeFromWishList(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<WishListDto>> getUserWishList(@PathVariable Long userId) {
        return ResponseEntity.ok(wishListService.getUserWishList(userId));
    }
    // ${userId}/${productId}
    @GetMapping("/{userId}/{productId}")
    public ResponseEntity<Boolean> isProductInWishList(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishListRepository.existsByUserIdAndProductId(userId, productId));
    }

    // return list of product in wishlist
    @GetMapping("/product/{userId}")
    public ResponseEntity<?> getProductInWishList(
      
        @PathVariable Long userId) {
       
        return ResponseEntity.ok(wishListService.getProductInWishList(userId));
    }
} 