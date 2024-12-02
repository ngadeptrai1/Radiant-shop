package com.backend.cosmetic.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.model.Voucher;
@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findVoucherByCode(String code );
    @Query("SELECT COUNT(o) FROM Order o WHERE o.voucher.code = :code")
    Long countVoucherUsage(String code);
    boolean existsByCode(String code);
    @Query("select v FROM  Voucher  v where v.active = true ")
    List<Voucher> findAllByActiveIsTrue();
}
