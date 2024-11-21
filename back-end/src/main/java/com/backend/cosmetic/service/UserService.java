package com.backend.cosmetic.service;

import java.util.List;

import com.backend.cosmetic.dto.StaffCreateDto;
import com.backend.cosmetic.dto.UserResponseDto;
import com.backend.cosmetic.dto.UserUpdateDto;
import com.backend.cosmetic.dto.WalkInCustomerDto;

public interface UserService {
    List<UserResponseDto> getUsers();
    UserResponseDto getUserById(Long id);
    UserResponseDto updateUser(Long id, UserUpdateDto updateDto);
    void deleteUser(Long id);
    UserResponseDto getCurrentUser();
    UserResponseDto createWalkInCustomer(WalkInCustomerDto walkInCustomerDto);
    List<UserResponseDto> searchCustomers(String phone, String name);
    List<UserResponseDto> getUsersByRole(String roleName);
    List<UserResponseDto> getUsersByRoles(List<String> roleNames);
    UserResponseDto createStaff(StaffCreateDto staffDto);
    UserResponseDto updateStaff(Long id, StaffCreateDto staffDto);
    void deleteStaff(Long id);
    List<UserResponseDto> searchStaff(String username, String email, String phone);
} 