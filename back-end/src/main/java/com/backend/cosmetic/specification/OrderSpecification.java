package com.backend.cosmetic.specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.backend.cosmetic.model.Order;

import jakarta.persistence.criteria.Predicate;

public class OrderSpecification {
    
    public static Specification<Order> getOrderSpecification(
            String status, 
            LocalDateTime startDate, 
            LocalDateTime endDate) {
            
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Add status condition if provided
            if (status != null && !status.isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                    criteriaBuilder.lower(root.get("status")), 
                    status.toLowerCase()
                ));
            }
            
            // Add date range conditions if provided
            if (startDate != null && endDate != null) {
                predicates.add(criteriaBuilder.between(
                    root.get("createdDate"), 
                    startDate, 
                    endDate
                ));
            } else if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("createdDate"), 
                    startDate
                ));
            } else if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("createdDate"), 
                    endDate
                ));
            }
            // order by created date
            query.orderBy(criteriaBuilder.desc(root.get("createdDate")));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
} 