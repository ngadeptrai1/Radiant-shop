package com.backend.cosmetic.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Table(name = "product_details")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ProductDetail  extends BaseModel{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, name = "sale_price")
    private long salePrice;

    private int discount;

    private int quantity;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "product_id" , referencedColumnName = "id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "color_id" , referencedColumnName = "id")
    private Color color ;
}
