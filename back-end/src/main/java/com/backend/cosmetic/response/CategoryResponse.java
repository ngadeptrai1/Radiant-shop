package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Category;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
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

    public static CategoryResponse fromCategory(Category category, Set<Integer> visitedIds) {
        if (category == null || visitedIds.contains(category.getId())) {
            return null;
        }
        visitedIds.add(category.getId());

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .parentCategory(
                        category.getParentCategory() != null
                                ? CategoryResponse.fromCategory(category.getParentCategory(), new HashSet<>(visitedIds))
                                : null
                )
                .subCategories(
                        category.getSubCategories() != null
                                ? category.getSubCategories().stream()
                                .map(subCategory -> CategoryResponse.fromCategory(subCategory, new HashSet<>(visitedIds)))
                                .collect(Collectors.toList())
                                : null
                )
                .activate(category.isActive())
                .build();
    }
}
