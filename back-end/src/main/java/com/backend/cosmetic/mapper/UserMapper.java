package com.backend.cosmetic.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.backend.cosmetic.dto.UserResponseDto;
import com.backend.cosmetic.model.User;

@Component
public class UserMapper {
    
    public UserResponseDto toResponseDto(User user) {
        return UserResponseDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phoneNumber(user.getPhoneNum())
            .provider(user.getProvider())
            .blocked(user.isBlocked())
            .enabled(user.isEnabled())
            .roles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()))
            .createdAt(user.getCreatedDate())
            .updatedAt(user.getUpdatedDate())
            .build();
    }
} 