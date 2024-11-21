package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

import org.hibernate.annotations.BatchSize;

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
    @JoinColumn(name = "category_id",referencedColumnName = "id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id",referencedColumnName = "id")
    private Brand brand;

    @BatchSize(size = 20)
    @OneToMany(mappedBy="product", fetch = FetchType.LAZY)
    private List<ProductImage> productImages;

    @BatchSize(size = 20)
    @OneToMany(mappedBy="product", fetch = FetchType.LAZY)
    private List<ProductDetail> productDetails;
}
