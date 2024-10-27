package com.backend.cosmetic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class ProductDTO implements Serializable {
    private Long id;
    @NotEmpty(message = "Product name cannot be empty")
    @NotNull(message = "Product name cannot be null")
    @Size(min = 6 , max = 200, message = "Product name must between 6 - 200 characters")
    private String name;
    @NotEmpty(message = "Product description cannot be empty")
    @NotNull(message = "Product description cannot be null")
    @Min(value = 100 , message = "Description must be greater than 100")
    private String description;
    private boolean activate = true;
    @NotNull(message = "Product thumbnail cannot be null")
    private MultipartFile thumbnail;
    @JsonProperty(value = "product_images")
    @Size(min = 2 , max = 4 , message = "Only  2 - 4 photos are allowed ")
    private List<MultipartFile> productImages;
    @NotNull(message = "Category id  cannot be null")
    @Min(value = 0, message = "Category id is not valid ")
    @JsonProperty(value = "category_id")
    private int categoryId;
    @NotNull(message = "Brand id cannot be null")
    @Min(value = 0, message = "Brand id is not valid ")
    @JsonProperty(value = "brand_id")
    private int brandId;
}
