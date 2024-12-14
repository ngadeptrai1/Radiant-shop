package com.backend.cosmetic.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, 
                                      JpaSpecificationExecutor<Order> {

    List<Order> findAllByUserIdOrderByCreatedDateDesc(Long id);
    List<Order> findAllByEmailOrderByIdDesc(String email);

    List<Order> findAllByCreatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.status = :status")
    Optional<Long> sumFinalAmountByStatus(@Param("status") String status);

    @Query("SELECT o.status as status, COUNT(o) as count FROM Order o " +
           "WHERE o.type = :type " +
           "GROUP BY o.status")
    List<Object[]> countOrdersByStatusAndType(@Param("type") String type);

    @Query("SELECT DATE(o.createdDate) as date, " +
           "COUNT(o) as orderCount, " +
           "SUM(o.finalAmount) as revenue " +
           "FROM Order o " +
           "WHERE o.status = 'SUCCESS' " +
           "GROUP BY DATE(o.updatedDate) " )
    List<Object[]> getRevenueStats();

    @Query("SELECT SUM(o.finalAmount) FROM Order o " +
           "WHERE o.status = 'SUCCESS' " +
           "AND DATE(o.updatedDate) = DATE(:date)")
    Long getTodayRevenue(@Param("date") LocalDateTime date);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") String status);

    @Query("SELECT SUM(o.finalAmount) FROM Order o " +
           "WHERE o.status = 'SUCCESS' " +
           "AND o.updatedDate BETWEEN :startDate AND :endDate")
    Long getTotalRevenue(@Param("startDate") LocalDateTime startDate, 
                        @Param("endDate") LocalDateTime endDate);

    List<Order> findAllByEmailOrderByCreatedDateDesc(String email);

    @Query("SELECT MONTH(o.updatedDate) as month, COUNT(o) as orderCount, SUM(o.finalAmount) as revenue " +
           "FROM Order o " +
           "WHERE o.status = 'SUCCESS' " +
           "AND YEAR(o.updatedDate) = :year " +
           "GROUP BY MONTH(o.updatedDate) " +
           "ORDER BY month")
    List<Object[]> getMonthlyRevenueStats(@Param("year") int year);

    @Query("SELECT DISTINCT YEAR(o.updatedDate) " +
           "FROM Order o " +
           "WHERE o.status = 'SUCCESS' " +
           "ORDER BY YEAR(o.updatedDate) DESC")
    List<Integer> getAvailableYears();
}