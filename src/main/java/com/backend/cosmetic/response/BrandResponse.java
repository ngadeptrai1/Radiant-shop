package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Brand;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Builder
@Getter
@Setter
public class BrandResponse {
    private Integer id;
    private String name;
    private String thumbnail;
    private boolean active;

    public static BrandResponse fromBrand(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .thumbnail(brand.getThumbnail())
                .active(brand.isActive())
                .build();
    }
}
