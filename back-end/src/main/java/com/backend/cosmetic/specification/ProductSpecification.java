package com.backend.cosmetic.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.backend.cosmetic.model.Product;

import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {
    
    public static Specification<Product> getProductSpecification(
            List<Integer> categoryIds,
            List<Long> brandIds,
            String name,
            Double minPrice,
            Double maxPrice,
            Boolean active,
            String sort,
            String direction) {
            
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Filter by categories
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
                predicates.add(criteriaBuilder.equal(root.get("category").get("active"), true));
            }
            
            // Filter by brands
            if (brandIds != null && !brandIds.isEmpty()) {
                predicates.add(root.get("brand").get("id").in(brandIds));
                predicates.add(criteriaBuilder.equal(root.get("brand").get("active"), true));
            }
            
            // Filter by name
            if (name != null && !name.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%"
                ));
            }
            
            // Filter by price range using product details
            if (minPrice != null || maxPrice != null) {
                var detailsJoin = root.join("productDetails");

                if (minPrice != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        detailsJoin.get("salePrice"), minPrice
                    ));
                }
                if (maxPrice != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        detailsJoin.get("salePrice"), maxPrice
                    ));
                }

                // Add check active of product details and color, and quantity > 0
                predicates.add(criteriaBuilder.equal(detailsJoin.get("active"), true));
                predicates.add(criteriaBuilder.equal(detailsJoin.get("color").get("active"), true));
                predicates.add(criteriaBuilder.greaterThan(detailsJoin.get("quantity"), 0));

                // Add distinct to avoid duplicate products
                query.distinct(true);
            }
            
            // Filter by active status of product, brand, and category
            predicates.add(criteriaBuilder.equal(root.get("active"), true));
            
            // Add sorting logic
            if (sort != null && !sort.isEmpty()) {
                // Join with productDetails if sorting by price
                if (sort.equals("price")) {
                    var detailsJoin = root.join("productDetails");
                    if (direction != null && direction.equalsIgnoreCase("desc")) {
                        query.orderBy(criteriaBuilder.desc(detailsJoin.get("salePrice")));
                    } else {
                        query.orderBy(criteriaBuilder.asc(detailsJoin.get("salePrice")));
                    }
                } else {
                    // Sort by name or createdDate
                    String fieldName = sort.equals("name") ? "name" : "createdDate";
                    if (direction != null && direction.equalsIgnoreCase("desc")) {
                        query.orderBy(criteriaBuilder.desc(root.get(fieldName)));
                    } else {
                        query.orderBy(criteriaBuilder.asc(root.get(fieldName)));
                    }
                }
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
} 