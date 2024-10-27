package com.backend.cosmetic.service.impl;


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
import com.backend.cosmetic.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;


@Component
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    @Qualifier("fileHandleService")
    private final FileHandleService fileService;
    private final ProductRepository productRepository;
    private final ProductImageService productImageService;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Override
    @Transactional(rollbackFor = {DataNotFoundException.class,IOException.class,NullPointerException.class})
    public ProductResponse saveProduct(ProductDTO product) throws IOException, IdNotFoundException {

        MultipartFile thumbnail = product.getThumbnail();
        if(thumbnail.getSize() > 10* 1024*1024) { // > 10mb
            throw new FileException("File too large , Maximum size is 10MB", HttpStatus.PAYLOAD_TOO_LARGE);
        }
        if(thumbnail.getContentType()== null || !thumbnail.getContentType().startsWith("image/")){ // check is image
            throw new FileException("File must be an image",
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        }
        if(product.getProductImages()!= null || !product.getProductImages().isEmpty()){
            for (MultipartFile image :
                    product.getProductImages()) {
                if( image.getSize() > 10* 1024*1024) { // > 10mb
                    throw new FileException("File too large , Maximum size is 10MB", HttpStatus.PAYLOAD_TOO_LARGE);
                }
                if(image.getContentType()== null || !image.getContentType().startsWith("image/")){ // check is image
                    throw new FileException("File must be an image",
                            HttpStatus.UNSUPPORTED_MEDIA_TYPE);
                }
            }
        }
        Brand brand = brandRepository.findById(product.getBrandId()).orElseThrow();
        Category category = categoryRepository.findById(product.getCategoryId()).orElseThrow();

        var newProduct = new Product().builder()
                .name(product.getName())
                .category(category)
                .brand(brand)
                .description(product.getDescription())
                .thumbnail("");

        Product entityProduct = productRepository.save(newProduct.build());
         entityProduct.setThumbnail( fileService.uploadThumbnail(product.getThumbnail()));
        List<ProductImage> listImages = new LinkedList<>();

        if( product.getProductImages() != null || !product.getProductImages().isEmpty()){

            product.getProductImages().forEach(
                    image -> {
                        ProductImage prImage = ProductImage.builder()
                                .url("")
                                .product(entityProduct).build();
                        try {
                            fileService.uploadCoudary(image,prImage);
                            listImages.add(prImage);
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
            );
        }else{
            throw new DataNotFoundException("Images can not be null or empty !");
        }
        listImages.forEach(image->{
            while (image.getUrl().isBlank()){
                Thread.onSpinWait();
            }
        });
        while (entityProduct.getThumbnail().isBlank()){
            Thread.onSpinWait();
        }
        entityProduct.setProductImages(productImageService.saveAll(listImages));
        return ProductResponse.fromProduct(entityProduct);
    }

    @Override
    public ProductResponse updateProduct(ProductDTO product, Long id) {
        Product entity = productRepository.findById(id).orElseThrow(
                () ->  new DataNotFoundException("Not found product with id  " + id)
        );
        entity.setActive(product.isActivate());
        entity.setDescription(product.getDescription());
        entity.setName(product.getName());
        return ProductResponse.fromProduct(productRepository.save(entity) ) ;
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

}
