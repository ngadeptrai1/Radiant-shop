package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

import org.hibernate.annotations.BatchSize;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Table(name = "products", indexes = {
    @Index(name = "idx_product_name", columnList = "name"),
    @Index(name = "idx_product_category", columnList = "category_id"),
    @Index(name = "idx_product_brand", columnList = "brand_id")
})
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT",nullable = false)
    private String description;

    @Column(name = "thumbnail",length = 500,nullable = false)
    private String thumbnail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Brand brand;

    @BatchSize(size = 20)
    @OneToMany(mappedBy="product", fetch = FetchType.LAZY)
    @JsonManagedReference("product-images")
    private List<ProductImage> productImages;

    @BatchSize(size = 20)
    @OneToMany(mappedBy="product", fetch = FetchType.LAZY)
    @JsonManagedReference("product-details")
    private List<ProductDetail> productDetails;
}
