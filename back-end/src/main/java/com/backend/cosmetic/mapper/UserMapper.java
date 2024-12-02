package com.backend.cosmetic.mapper;

import java.util.List;
import java.util.stream.Collectors;

import com.backend.cosmetic.model.ProductDetail;
import com.backend.cosmetic.response.ProductDetailResponse;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import com.backend.cosmetic.dto.UserResponseDto;
import com.backend.cosmetic.model.User;

@Mapper(componentModel= "spring")
public interface UserMapper {

    default UserResponseDto toResponseDto(User user) {
        UserResponseDto response = new UserResponseDto();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNum());
        response.setProvider(user.getProvider());
        response.setBlocked(user.isBlocked());
        response.setEnabled(user.isEnabled());
        response.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()));
        response.setCreatedAt(user.getCreatedDate());
        response.setUpdatedAt(user.getUpdatedDate());
        return response;
    }

    default List<UserResponseDto> toResponseDtoList(List<User> users) {
        return users.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
} 