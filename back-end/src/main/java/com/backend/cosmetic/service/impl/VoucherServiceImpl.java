package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.dto.VoucherDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.model.Voucher;
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
                .startDate(voucherDTO.getStartDate())
                .endDate(voucherDTO.getEndDate())
                .usageLimit(voucherDTO.getUsageLimit())
                .description(voucherDTO.getDescription())
                .build();

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
        voucher.setStartDate(voucherDTO.getStartDate());
        voucher.setEndDate(voucherDTO.getEndDate());
        voucher.setUsageLimit(voucherDTO.getUsageLimit());
        voucher.setDescription(voucherDTO.getDescription());

        Voucher updatedVoucher = voucherRepository.save(voucher);
        return VoucherResponse.fromVoucher(updatedVoucher);
    }

    @Override
    public void delete(Long id) {
        Voucher voucher = voucherRepository.findById(id).orElseThrow(
                () ->  new DataNotFoundException("Not found product with id  " + id))  ;
        voucher.setActive(false);
        voucherRepository.save(voucher);
    }

    @Override
    public List<VoucherResponse> findAll(Pageable pageable) {
        return voucherRepository.findAll(pageable)
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

        if (voucher.getMinOrderAmount() >totalAmount ) {
            throw new DataInvalidException("Voucher min order amount has been reached");
        }
        return VoucherResponse.fromVoucher(voucher);
    }
}
