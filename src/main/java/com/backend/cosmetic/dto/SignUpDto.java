package com.backend.cosmetic.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpDto {
    private String username;
    private String fullName;
    private String email;
    private String password;
}
