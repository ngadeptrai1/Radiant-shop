package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Table(name = "product_images")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false,length = 500)
    private String url;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "product_id" , referencedColumnName = "id")
    @JsonBackReference("product-images")
    private Product product;
}
