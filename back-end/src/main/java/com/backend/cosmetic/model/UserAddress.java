package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "user_address")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class UserAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column( nullable = false)
    private String address;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column( nullable = false)
    private String email;



}
