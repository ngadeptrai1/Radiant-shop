package com.backend.cosmetic.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.UserAddressDTO;
import com.backend.cosmetic.exception.ResourceNotFoundException;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.model.UserAddress;
import com.backend.cosmetic.repository.UserAddressRepository;
import com.backend.cosmetic.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserAddressService {
    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;

    public UserAddress createAddress(UserAddressDTO addressDTO,Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        UserAddress address = UserAddress.builder()
            .provinceId(addressDTO.getProvinceId())
            .provinceName(addressDTO.getProvinceName())
            .districtId(addressDTO.getDistrictId())
            .districtName(addressDTO.getDistrictName())
            .fullname(addressDTO.getFullName())
            .wardCode(addressDTO.getWardCode())
            .wardName(addressDTO.getWardName())
            .address(addressDTO.getAddress())
            .phoneNumber(addressDTO.getPhoneNumber())
            .email(addressDTO.getEmail())
            .user(user)
            .build();
        
        return userAddressRepository.save(address);
    }

    public List<UserAddress> getUserAddresses(Long userId) {
        return userAddressRepository.findByUserId(userId);

    }

    public UserAddress updateAddress(Long id, UserAddressDTO addressDTO) {
        UserAddress address = userAddressRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        
        address.setProvinceId(addressDTO.getProvinceId());
        address.setProvinceName(addressDTO.getProvinceName());
        address.setDistrictId(addressDTO.getDistrictId());
        address.setDistrictName(addressDTO.getDistrictName());
        address.setWardCode(addressDTO.getWardCode());
        address.setFullname(addressDTO.getFullName());
        address.setWardName(addressDTO.getWardName());
        address.setAddress(addressDTO.getAddress());
        address.setPhoneNumber(addressDTO.getPhoneNumber());
        address.setEmail(addressDTO.getEmail());
        
        return userAddressRepository.save(address);
    }
    
    public List<UserAddress> findAllByUserId(Long userId){
        return userAddressRepository.findByUserId(userId);
    }

    public void deleteAddress(Long id) {
        userAddressRepository.deleteById(id);
    }

} 