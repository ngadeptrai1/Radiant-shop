package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Category;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Builder
@Getter
@Setter
public class CategoryResponse {

    private Integer id;
    private String name;
    private CategoryResponse parentCategory;
    private List<CategoryResponse> subCategories;
    private boolean activate ;

    public static CategoryResponse fromCategory(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentCategory(
                        category.getParentCategory() != null
                                ? CategoryResponse.fromCategory(category.getParentCategory())
                                : null
                )
                .subCategories(
                        category.getSubCategories() != null
                                ? category.getSubCategories().stream()
                                .map(CategoryResponse::fromCategory)
                                .collect(Collectors.toList())
                                : null
                )
                .build();
    }
}
