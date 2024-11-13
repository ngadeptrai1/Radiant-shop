package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

@Table(name = "vouchers")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Voucher extends BaseModel{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Long value;

    @Column(name = "max_discount_amout")
    private Long maxDiscountAmount;

    @Column(name = "min_order_amout")
    private Long minOrderAmount;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(length = 500,columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "voucher")
    private List<Order> applyOrder ;
}
