package com.backend.cosmetic.service;

import com.backend.cosmetic.dto.UserResponseDto;
import com.backend.cosmetic.dto.UserUpdateDto;
import com.backend.cosmetic.dto.WalkInCustomerDto;

import java.util.List;

public interface UserService {
    List<UserResponseDto> getUsers();
    UserResponseDto getUserById(Long id);
    UserResponseDto updateUser(Long id, UserUpdateDto updateDto);
    void deleteUser(Long id);
    UserResponseDto getCurrentUser();
    UserResponseDto createWalkInCustomer(WalkInCustomerDto walkInCustomerDto);
    List<UserResponseDto> searchCustomers(String phone, String name);
    List<UserResponseDto> getUsersByRole(String roleName);
} 