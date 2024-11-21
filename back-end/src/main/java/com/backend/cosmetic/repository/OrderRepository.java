package com.backend.cosmetic.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAllByUserId(Long id, Pageable pageable);
    Page<Order> findAllByStatus(String status, Pageable pageable);


    Page<Order> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    List<Order> findByStatusAndCreatedDateBetween(String status, LocalDateTime startDate, LocalDateTime endDate);
    List<Order> findByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") String status);
    
    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.status = :status")
    Optional<Long> sumFinalAmountByStatus(@Param("status") String status);

}