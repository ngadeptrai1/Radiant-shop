package com.backend.cosmetic.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.UserResponseDto;
import com.backend.cosmetic.dto.UserUpdateDto;
import com.backend.cosmetic.dto.WalkInCustomerDto;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.mapper.UserMapper;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.service.UserManager;
import com.backend.cosmetic.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserManager userManager;

    @Override
    public List<UserResponseDto> getUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        return userMapper.toResponseDto(user);
    }

    @Override
    public UserResponseDto updateUser(Long id, UserUpdateDto updateDto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        
        user.setFullName(updateDto.getFullName());
        user.setPhoneNum(updateDto.getPhoneNum());
        user.setEmail(updateDto.getEmail());
        
        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDto(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public UserResponseDto getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        return userMapper.toResponseDto(user);
    }

    @Override
    public UserResponseDto createWalkInCustomer(WalkInCustomerDto walkInCustomerDto) {
        User newUser = User.builder()
            .fullName(walkInCustomerDto.getFullName())
            .phoneNum(walkInCustomerDto.getPhoneNum())
            .email(walkInCustomerDto.getEmail())
            .provider("WALK_IN")
            .enabled(true)
            .build();
        
        User savedUser = userManager.createWalkInCustomer(newUser);
        return userMapper.toResponseDto(savedUser);
    }

    @Override
    public List<UserResponseDto> searchCustomers(String phone, String name) {
        List<User> users;
        if (phone != null && !phone.isEmpty()) {
            users = userRepository.findByPhoneNumContaining(phone);
        } else if (name != null && !name.isEmpty()) {
            users = userRepository.findByFullNameContainingIgnoreCase(name);
        } else {
            users = userRepository.findAll();
        }
        
        return users.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDto> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName).stream()
            .map(userMapper::toResponseDto)
            .toList();
    }
} 