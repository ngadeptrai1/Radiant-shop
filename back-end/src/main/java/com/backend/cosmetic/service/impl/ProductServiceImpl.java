package com.backend.cosmetic.service.impl;


import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.backend.cosmetic.dto.ProductDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.exception.FileException;
import com.backend.cosmetic.exception.IdNotFoundException;
import com.backend.cosmetic.model.Brand;
import com.backend.cosmetic.model.Category;
import com.backend.cosmetic.model.Product;
import com.backend.cosmetic.model.ProductImage;
import com.backend.cosmetic.repository.BrandRepository;
import com.backend.cosmetic.repository.CategoryRepository;
import com.backend.cosmetic.repository.ProductRepository;
import com.backend.cosmetic.response.ProductResponse;
import com.backend.cosmetic.service.FileHandleService;
import com.backend.cosmetic.service.ProductDetailService;
import com.backend.cosmetic.service.ProductImageService;
import com.backend.cosmetic.service.ProductService;

import lombok.RequiredArgsConstructor;


@Component
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    @Qualifier("fileHandleService")
    private final FileHandleService fileService;
    private final ProductRepository productRepository;
    private final ProductImageService productImageService;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductDetailService productDetailService;

    @Override
    @Transactional(rollbackFor = {DataNotFoundException.class,IOException.class,NullPointerException.class})
    public ProductResponse saveProduct(ProductDTO product) throws IOException, IdNotFoundException {
        // Validate files first
        validateFiles(product);

        Brand brand = brandRepository.findById(product.getBrandId()).orElseThrow();
        Category category = categoryRepository.findById(product.getCategoryId()).orElseThrow();

        var newProduct = new Product().builder()
                .name(product.getName())
                .category(category)
                .brand(brand)
                .description(product.getDescription())
                .thumbnail("");

        Product entityProduct = productRepository.save(newProduct.build());

        // Create CompletableFuture for async operations
        CompletableFuture<String> thumbnailFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return fileService.uploadThumbnail(product.getThumbnail());
            } catch (IOException e) {
                throw new CompletionException(e);
            }
        });

        CompletableFuture<List<ProductImage>> imagesFuture = CompletableFuture.supplyAsync(() -> {
            if (product.getProductImages() == null || product.getProductImages().isEmpty()) {
                throw new DataNotFoundException("Images cannot be null or empty!");
            }

            return product.getProductImages().parallelStream()
                    .map(image -> {
                        ProductImage prImage = ProductImage.builder()
                                .product(entityProduct)
                                .url("")
                                .build();
                        try {
                            fileService.uploadCoudary(image, prImage);
                            return prImage;
                        } catch (IOException e) {
                            throw new CompletionException(e);
                        }
                    })
                    .collect(Collectors.toList());
        });


            if (product.getProductDetails() != null && !product.getProductDetails().isEmpty()) {
                productDetailService.save(product.getProductDetails(), entityProduct);
            }
        try {
            // Wait for all async operations to complete
            String thumbnailUrl = thumbnailFuture.join();
            List<ProductImage> productImages = imagesFuture.join();
            entityProduct.setThumbnail(thumbnailUrl);
            entityProduct.setProductImages(productImageService.saveAll(productImages));
            
            return ProductResponse.fromProduct(entityProduct);
        } catch (CompletionException e) {
            throw new RuntimeException("Error processing product data: " + e.getMessage(), e.getCause());
        }
    }

    private void validateFiles(ProductDTO product) {
        // Validate thumbnail
        MultipartFile thumbnail = product.getThumbnail();
        validateFile(thumbnail, "Thumbnail");

        // Validate product images
        if (product.getProductImages() != null) {
            product.getProductImages().forEach(image -> validateFile(image, "Product image"));
        }
    }

    private void validateFile(MultipartFile file, String fileType) {
        if (file.getSize() > 10 * 1024 * 1024) { // > 10mb
            throw new FileException(fileType + " too large, Maximum size is 10MB", HttpStatus.PAYLOAD_TOO_LARGE);
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new FileException(fileType + " must be an image", HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        }
    }

    @Override
    @Transactional(rollbackFor = {DataNotFoundException.class,IOException.class,NullPointerException.class})
    public ProductResponse updateProduct(ProductDTO product, Long id) {
        // Validate product
        if (product.getCategoryId() <= 0) {
            throw new DataNotFoundException("Category not found");
        }
        if (product.getBrandId() <= 0) {
            throw new DataNotFoundException("Brand not found");
        }

        // Get existing product
        Product entityProduct = productRepository.findById(id).orElseThrow(
                () -> new DataNotFoundException("Not found product with id " + id)
        );

        // Update basic info
        entityProduct.setName(product.getName());
        entityProduct.setDescription(product.getDescription());
        entityProduct.setActive(product.isActivate());

        // Update category and brand
        Category category = categoryRepository.findById(product.getCategoryId())
                .orElseThrow(() -> new DataNotFoundException("Category not found"));
        Brand brand = brandRepository.findById(product.getBrandId())
                .orElseThrow(() -> new DataNotFoundException("Brand not found"));

        entityProduct.setCategory(category);
        entityProduct.setBrand(brand);

        // Update product details if provided
        if (product.getProductDetails() != null && !product.getProductDetails().isEmpty()) {
            productDetailService.update(product.getProductDetails(), entityProduct);
        }

        // Save and return
        entityProduct = productRepository.save(entityProduct);
        return ProductResponse.fromProduct(entityProduct);
    }
    
    @Override
    public Page<ProductResponse> findAll(Map<String, Object> filterCriteria, Pageable pageable) {
//        ProductSpecification spec = new ProductSpecification(filterCriteria);
        return productRepository.findAll(pageable).map(ProductResponse::fromProduct);
    }

    @Override
    public ProductResponse findById(Long id) {
        return ProductResponse.fromProduct(productRepository.findById(id).orElseThrow(
                () ->  new DataNotFoundException("Not found product with id  " + id)) ) ;
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(ProductResponse::fromProduct).toList();
    }

    @Override
    public ProductResponse deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow(
                () ->  new DataNotFoundException("Not found product with id  " + id))  ;
        product.setActive(false);
        productRepository.save(product);
        return ProductResponse.fromProduct(product);
    }

}
