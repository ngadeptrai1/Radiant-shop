package com.backend.cosmetic.service;


import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.VoucherDTO;
import com.backend.cosmetic.model.Voucher;
import com.backend.cosmetic.response.VoucherResponse;

@Service
public interface VoucherService {
    VoucherResponse findById(long id);
    VoucherResponse save (VoucherDTO voucher) throws IOException;
    VoucherResponse update(Long id, VoucherDTO voucher);
    VoucherResponse delete(Long id);
    List<VoucherResponse> findAll( );
    VoucherResponse findByCode(String code);
    VoucherResponse applyCode(String code , long totalAmount);
    long approveVoucher(String code,long totalAmount);
    List<VoucherResponse> findValidVouchersByAmount(long amount);
    Voucher getByCode(String code);
    List<VoucherResponse> findAllActiveVouchers();
}
