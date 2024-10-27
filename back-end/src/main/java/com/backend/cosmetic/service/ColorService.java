package com.backend.cosmetic.service;

import com.backend.cosmetic.dto.ColorDTO;
import com.backend.cosmetic.response.ColorResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public interface ColorService {
    ColorResponse findById(int id);
    ColorResponse save (ColorDTO colorDTO) throws IOException;
    ColorResponse update(Integer id, ColorDTO colorDTO);
    void delete(Integer id);
    List<ColorResponse> findAll(Pageable pageable);

}
