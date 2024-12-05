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
            LocalDateTime endDate,
            String name,
            String email,
            String phone) {
            
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

            // Add name condition if provided
            if (name != null && !name.isEmpty()) {
                predicates.add( criteriaBuilder.like(root.get("fullName"), "%" + name + "%"));
            }

            if (phone != null && !phone.isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("phoneNumber"), "%" + phone.toLowerCase() + "%"));
            }

            // email condition
            if (email != null && !email.isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("email"), "%" + email + "%"));
            }
            // order by created date
            query.orderBy(criteriaBuilder.desc(root.get("createdDate")));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));

            // phone condition


        };
    }
} 