package com.backend.cosmetic.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;

import com.backend.cosmetic.model.Voucher;
import com.backend.cosmetic.response.VoucherResponse;
@Mapper(componentModel = "spring")
public interface VoucherMapper {
  default VoucherResponse toVoucherResponse(Voucher voucher) {
    if(voucher == null) {
        return null;
    }
    VoucherResponse response =new VoucherResponse();
    response.setId(voucher.getId());
    response.setCode(voucher.getCode());
    response.setType(voucher.getType());
    response.setValue(voucher.getValue());
    response.setMaxDiscountAmount(voucher.getMaxDiscountAmount());
    response.setMinOrderAmount(voucher.getMinOrderAmount());
    response.setStartDate(voucher.getStartDate());
    response.setEndDate(voucher.getEndDate());
    response.setUsageLimit(voucher.getUsageLimit());
    response.setDescription(voucher.getDescription());
    response.setUsedAmount( voucher.getApplyOrder()!=null ? voucher.getApplyOrder().size():0);
    response.setActive(voucher.isActive());
    return response;
  }

  default List<VoucherResponse> toVoucherResponseList(List<Voucher> vouchers) {
    return vouchers.stream()
        .map(this::toVoucherResponse)
        .collect(Collectors.toList());
  }
}
