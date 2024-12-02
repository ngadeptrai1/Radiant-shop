package com.backend.cosmetic.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(name = "full_name")
    private String fullname;
    @Column(name = "province_id")   
    private Integer  provinceId;
    @Column(name = "province_name")
    private String provinceName;
    @Column(name = "district_id")
    private Integer  districtId;
    @Column(name = "district_name")
    private String districtName;
    @Column(name = "ward_code")
    private String wardCode;
    @Column(name = "ward_name")
    private String wardName;
    @Column( nullable = false)
    private String address;
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;
    @Column( nullable = false)
    private String email;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


}
