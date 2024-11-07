package com.backend.cosmetic.rest;

import com.backend.cosmetic.dto.VoucherDTO;
import com.backend.cosmetic.response.VoucherResponse;
import com.backend.cosmetic.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

//    private final VoucherService voucherService;
//
//    @PostMapping
//    public VoucherResponse createVoucher(@RequestBody VoucherDTO voucherDTO) throws IOException {
//        return voucherService.save(voucherDTO);
//    }
//
//    @GetMapping("/{id}")
//    public VoucherResponse getVoucher(@PathVariable Long id) {
//        return voucherService.findById(id);
//    }
//
//    @GetMapping
//    public List<VoucherResponse> getAllVouchers(@RequestParam("page") Optional<Integer> pageNum,
//                                                @RequestParam("size") Optional<Integer> size) {
//        Pageable page = PageRequest.of(pageNum.orElse(0), size.orElse(5),
//                Sort.by("id").descending());
//
//        return voucherService.findAll(page);
//    }
//
//    @PutMapping("/{id}")
//    public VoucherResponse updateVoucher(@PathVariable Long id, @RequestBody VoucherDTO voucherDTO) {
//        return voucherService.update(id, voucherDTO);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteVoucher(@PathVariable Long id) {
//        voucherService.delete(id);
//    }
//
//    @GetMapping("/apply")
//    public VoucherResponse applyCode(@RequestParam("code") String code , @RequestParam("totalAmount") long totalAmount) {
//        return voucherService.applyCode(code, totalAmount);
//    }
}
