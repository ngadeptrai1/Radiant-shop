package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.dto.ColorDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.exception.DataPresentException;
import com.backend.cosmetic.model.Brand;
import com.backend.cosmetic.model.Color;
import com.backend.cosmetic.repository.ColorRepository;

import com.backend.cosmetic.response.ColorResponse;
import com.backend.cosmetic.service.ColorService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class ColorServiceImpl implements ColorService {
    private final ColorRepository colorRepository;

    public ColorServiceImpl(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    @Override
    public ColorResponse findById(int id) {
        return null;
    }

    @Override
    public ColorResponse save(ColorDTO colorDTO) throws IOException {

        Color newColor = new Color();
        newColor.setHexCode(colorDTO.getHexCode());

        return ColorResponse.fromColor( colorRepository.save(newColor));
    }

    @Override
    public ColorResponse update(Integer id, ColorDTO colorDTO) {
        Color color = colorRepository.findById(id).orElseThrow(()->{
            return new DataNotFoundException("Brand with id "+id + " Not found ");
        });
        color.setHexCode(colorDTO.getHexCode());

        return ColorResponse.fromColor(colorRepository.save(color));
    }

    @Override
    public void delete(Integer id) {
        Color color = colorRepository.findById(id).orElseThrow(() ->{
            return new DataNotFoundException("Not found brand with id " + id);
        });

        colorRepository.delete(color);
    }

    @Override
    public List<ColorResponse> findAll(Pageable pageable) {
        List<Color> color = colorRepository.findAll(pageable).getContent();
        return color.stream()
                .map(ColorResponse::fromColor)
                .collect(Collectors.toList());
    }
}
