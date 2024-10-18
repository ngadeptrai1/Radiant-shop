package com.backend.cosmetic.service;


import com.backend.cosmetic.dto.BrandDTO;
import com.backend.cosmetic.model.Brand;
import com.backend.cosmetic.response.BrandResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public interface BrandService {
    BrandResponse findById(int id);
    BrandResponse save (BrandDTO brand) throws IOException;
    BrandResponse update(Integer id, BrandDTO brand);
    void delete(Integer id);
    List<BrandResponse> findAll(Pageable pageable);
    BrandResponse findByName(String name);
}
