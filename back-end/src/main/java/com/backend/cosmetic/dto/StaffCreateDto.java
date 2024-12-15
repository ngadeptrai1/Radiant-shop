package com.backend.cosmetic.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StaffCreateDto {
    @NotBlank
    private String fullName;
    
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String username;
    
    @NotBlank
    private String phoneNumber;
    

    private String password;

    private String role;

    private boolean enabled;
} 