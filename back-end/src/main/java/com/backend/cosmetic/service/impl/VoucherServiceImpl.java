package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.dto.VoucherDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.model.Voucher;
import com.backend.cosmetic.model.VoucherType;
import com.backend.cosmetic.repository.VoucherRepository;
import com.backend.cosmetic.response.VoucherResponse;
import com.backend.cosmetic.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class VoucherServiceImpl implements VoucherService {
    private final VoucherRepository voucherRepository;

    @Override
    public VoucherResponse findById(long id) {
        return voucherRepository.findById(id)
                .map(VoucherResponse::fromVoucher).orElseThrow(
                () ->  new DataNotFoundException("Not found voucher with id  " + id))  ;
    }

    @Override
    public VoucherResponse save(VoucherDTO voucherDTO) throws IOException {
        Voucher newVoucher = Voucher.builder()
                .code(voucherDTO.getCode())
                .type(voucherDTO.getType())
                .value(voucherDTO.getValue())
                .maxDiscountAmount(voucherDTO.getMaxDiscountAmount())
                .minOrderAmount(voucherDTO.getMinOrderAmount())
                .startDate(voucherDTO.getStartDate().plusDays(1))
                .endDate(voucherDTO.getEndDate().plusDays(1))
                .usageLimit(voucherDTO.getUsageLimit())
                .description(voucherDTO.getDescription())
                .build();
                newVoucher.setActive(voucherDTO.isActive());
        Voucher savedVoucher = voucherRepository.save(newVoucher);
        return VoucherResponse.fromVoucher(savedVoucher);
    }

    @Override
    public VoucherResponse update(Long id, VoucherDTO voucherDTO) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new DataInvalidException("Voucher not found"));

        voucher.setCode(voucherDTO.getCode());
        voucher.setType(voucherDTO.getType());
        voucher.setValue(voucherDTO.getValue());
        voucher.setMaxDiscountAmount(voucherDTO.getMaxDiscountAmount());
        voucher.setMinOrderAmount(voucherDTO.getMinOrderAmount());
        voucher.setStartDate(voucherDTO.getStartDate().plusDays(1));
        voucher.setEndDate(voucherDTO.getEndDate().plusDays(1));
        voucher.setUsageLimit(voucherDTO.getUsageLimit());
        voucher.setDescription(voucherDTO.getDescription());
        voucher.setActive(voucherDTO.isActive());
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return VoucherResponse.fromVoucher(updatedVoucher);
    }

    @Override
    public VoucherResponse delete(Long id) {
        Voucher voucher = voucherRepository.findById(id).orElseThrow(
                () ->  new DataNotFoundException("Not found product with id  " + id))  ;
        voucher.setActive(false);
      return VoucherResponse.fromVoucher( voucherRepository.save(voucher));
    }

    @Override
    public List<VoucherResponse> findAll() {
        return voucherRepository.findAll()
                .stream()
                .map(VoucherResponse::fromVoucher)
                .collect(Collectors.toList());
    }

    @Override
    public VoucherResponse findByCode(String code) {
        return voucherRepository.findVoucherByCode(code)
                .map(VoucherResponse::fromVoucher).orElseThrow(
                        () ->  new DataNotFoundException("Not found voucher with code  " + code))  ;
    }
    @Override
    public VoucherResponse applyCode(String code , long totalAmount) {
        Voucher voucher = voucherRepository.findVoucherByCode(code).orElseThrow(
                        () ->  new DataNotFoundException("Not found voucher with code  " + code))  ;
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
            throw new DataInvalidException("Voucher is not valid at this time");
        }
        Long usageCount = voucherRepository.countVoucherUsage(code);
        if (voucher.getUsageLimit() != null && usageCount >= voucher.getUsageLimit()) {
            throw new DataInvalidException("Voucher usage limit has been reached");
        }
        if (voucher.getMinOrderAmount() > totalAmount ) {
            throw new DataInvalidException("Voucher min order amount has been reached");
        }
        return VoucherResponse.fromVoucher(voucher);
    }

    @Override
    public long approveVoucher(String code ,long totalAmount) {
        Voucher voucher = voucherRepository.findVoucherByCode(code).orElseThrow(()->
                new DataNotFoundException("Not found voucher")
        );
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())) {
            throw new DataInvalidException("Voucher is not valid at this time");
        }

        Long usageCount = voucherRepository.countVoucherUsage(code);

        if (voucher.getUsageLimit() != null && usageCount >= voucher.getUsageLimit()) {
            throw new DataInvalidException("Voucher usage limit has been reached");
        }

        if (voucher.getMinOrderAmount() > totalAmount ) {
            throw new DataInvalidException("Voucher min order amount has been reached");
        }
        long totalDiscount = 0;

        if(voucher.getType().equalsIgnoreCase(VoucherType.PERCENT)){
            totalDiscount = (totalAmount*voucher.getValue())/100;
            if(totalDiscount > voucher.getMaxDiscountAmount()){
                totalDiscount = voucher.getMaxDiscountAmount();
            }
        }
        if(voucher.getType().equalsIgnoreCase(VoucherType.VALUE)){
            totalDiscount = voucher.getValue();
        }
        return totalDiscount;
    }

    @Override
    public List<VoucherResponse> findValidVouchersByAmount(long amount) {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findAll().stream()
                .filter(voucher -> 
                    voucher.isActive() &&
                    now.isAfter(voucher.getStartDate()) &&
                    now.isBefore(voucher.getEndDate()) &&
                    amount >= voucher.getMinOrderAmount() &&
                    (voucher.getUsageLimit() == null || 
                     voucherRepository.countVoucherUsage(voucher.getCode()) < voucher.getUsageLimit())
                )
                .map(VoucherResponse::fromVoucher)
                .collect(Collectors.toList());
    }


}
