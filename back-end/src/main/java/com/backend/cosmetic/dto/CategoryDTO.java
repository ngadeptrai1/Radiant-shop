package com.backend.cosmetic.dto;

import com.backend.cosmetic.model.Category;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class CategoryDTO {

    private Integer id;
    @NotEmpty(message = "Category name cannot be empty")
    @NotNull(message = "Category name cannot be null")
    @Size(min = 6 , max = 200, message = "Category name must between 6 - 200 characters")
    private String name;
    @JsonProperty("parent_id")
    private Integer parentId;

    private boolean activate = true;
}
