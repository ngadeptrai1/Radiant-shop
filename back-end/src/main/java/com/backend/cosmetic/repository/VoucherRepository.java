package com.backend.cosmetic.repository;

import com.backend.cosmetic.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findVoucherByCode(String code );
    @Query("SELECT COUNT(o) FROM Order o WHERE o.voucher.code = :code")
    Long countVoucherUsage(String code);
}