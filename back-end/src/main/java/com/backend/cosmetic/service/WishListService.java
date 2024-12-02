package com.backend.cosmetic.service;


import java.awt.print.Pageable;

import com.backend.cosmetic.dto.WishListDto;
import com.backend.cosmetic.exception.ResourceNotFoundException;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.model.WishList;
import com.backend.cosmetic.repository.ProductRepository;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.repository.WishListRepository;

import com.backend.cosmetic.response.ProductResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.hibernate.query.Page;

import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.mapper.ProductMapper;

@Service
@RequiredArgsConstructor
public class WishListService {
    private final WishListRepository wishListRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    public WishListDto addToWishList(Long userId, Long productId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (wishListRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new DataInvalidException("Product already in wishlist");
        }

        WishList wishList = WishList.builder()
            .user(user)
            .product(product)
            .likeDate(LocalDateTime.now())
            .active(true)
            .build();

        WishList saved = wishListRepository.save(wishList);
        return convertToDto(saved);
    }

    public void removeFromWishList(Long userId, Long productId) {
        WishList wishList = wishListRepository.findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));
        wishList.setActive(false);
        wishListRepository.save(wishList);
    }

    public List<WishListDto> getUserWishList(Long userId) {
        return wishListRepository.findByUserIdAndActiveTrue(userId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    private WishListDto convertToDto(WishList wishList) {
        return WishListDto.builder()
            .id(wishList.getId())
            .userId(wishList.getUser().getId())
            .productId(wishList.getProduct().getId())
            .likeDate(wishList.getLikeDate())
            .active(wishList.isActive())
            .build();
    }

    public List<ProductResponse> getProductInWishList(Long userId) {
        return productMapper.toDTOs( wishListRepository.findProductByUserIdAndActiveTrue(userId)) ;
                        
    }
} 