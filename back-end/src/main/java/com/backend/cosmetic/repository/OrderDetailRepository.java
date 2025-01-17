package com.backend.cosmetic.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.dto.OrderDetailProjection;
import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.model.OrderDetail;
import com.backend.cosmetic.model.ProductDetail;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    List <OrderDetail> findAllByOrderId(Long orderId);

    @Query(nativeQuery = true, value = """
    SELECT 
        od.id,
        od.quantity,
        od.price,
        p.name as productName,
        c.name as productColor,
        p.thumbnail,
        pd.id as productDetailId
     FROM order_details od
     JOIN product_details pd ON od.product_detail_id = pd.id
     JOIN products p ON pd.product_id = p.id
     JOIN colors c ON pd.color_id = c.id
     WHERE od.order_id = :orderId
    """)
    List<OrderDetailProjection> findByOrderId(@Param("orderId") Long orderId);

    Optional<OrderDetail> findByOrderAndProductDetail(Order order, ProductDetail productDetail);
}