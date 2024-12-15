package com.backend.cosmetic.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class BrandDTO {
    @Nullable
    Integer id;

    @NotEmpty(message = "Brand name cannot be empty")
    @NotNull(message = "Brand name cannot be null")
    @Size(min = 6 , max = 200, message = "Brand name must between 6 - 200 characters")
    private String name;

    private MultipartFile thumbnail;

    private boolean active= true;
}
