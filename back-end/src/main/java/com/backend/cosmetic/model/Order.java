package com.backend.cosmetic.model;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
    @SequenceGenerator(name = "order_seq", sequenceName = "order_sequence", initialValue = 1000123112, allocationSize = 1)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id" , referencedColumnName = "id",nullable = true)
    private User user;

    @Column(name = "shipping_cost",nullable = true)
    private long shippingCost;

    @Column(name = "full_name", nullable = true)
    private String fullName;

    @Column(name="phone_number", nullable = true)
    private String phoneNumber;

    @Column(name = "email",nullable = true)
    private String email;

    @Column(columnDefinition = "TEXT",nullable = true)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String note;

    private String status;

    @Column(name = "total_order_amount",nullable = false)
    private long totalOrderAmount;

    @Column(name = "voucher_amount ",nullable = true)
    private long voucherAmount ;

    @Column(name = "total_items",nullable = false)
    private int totalItems;

    @Column(name="final_amount",nullable = false)
    private long finalAmount;

    @JoinColumn(name = "voucher_code",referencedColumnName = "code",nullable = true)
    @ManyToOne
    private Voucher voucher;

    @Column(name = "payment_method",nullable = true)
    private String paymentMethod;

    @Column(name = "payment_status ",nullable = true)
    private String paymentStatus;



    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderDetail> orderDetails ;
}
