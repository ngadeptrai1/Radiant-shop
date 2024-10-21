package com.backend.cosmetic.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class ColorDTO {
    @NotEmpty(message = "hexCode  cannot be empty")
    @NotNull(message = "hexCode cannot be null")
    @Size(min = 6 , max = 200, message = "hexCode name must between 6 - 200 characters")
    private String hexCode;
    private boolean active= true;
}
