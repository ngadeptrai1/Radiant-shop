package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.dto.BrandDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.exception.DataPresentException;
import com.backend.cosmetic.model.Brand;
import com.backend.cosmetic.repository.BrandRepository;
import com.backend.cosmetic.response.BrandResponse;
import com.backend.cosmetic.service.BrandService;

import com.backend.cosmetic.service.FileHandleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository brandRepository;
    private final FileHandleService fileHandleService;
    @Override
    public BrandResponse findById(int id) {
        return BrandResponse.fromBrand( brandRepository.findById(id).orElseThrow(() -> {
           return new DataNotFoundException("Brand with id "+id + " Not found ");
        }));
    }

    @Override
    public BrandResponse save(BrandDTO brand) throws IOException {
        if(brandRepository.findByName(brand.getName()).isPresent()){
            throw new DataPresentException("Brand with name "+brand.getName()+ " already exist ");
        }
        Brand newBrand = new Brand();
        newBrand.setName(brand.getName());
        newBrand.setActive(brand.isActive());
        newBrand.setThumbnail(fileHandleService.uploadThumbnail(brand.getThumbnail()));

        return BrandResponse.fromBrand( brandRepository.save(newBrand));
    }

    @Override
    public BrandResponse update(Integer id, BrandDTO brandUpdate) {
        Brand brand = brandRepository.findById(id).orElseThrow(()->{
            return new DataNotFoundException("Brand with id "+id + " Not found ");
        });
        brand.setName(brandUpdate.getName());
        brand.setActive(brandUpdate.isActive());

        if(brandUpdate.getThumbnail() != null){
            try {
                brand.setThumbnail(fileHandleService.uploadThumbnail(brandUpdate.getThumbnail()));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return BrandResponse.fromBrand( brandRepository.save(brand));
    }

    @Override
    public BrandResponse delete(Integer id) {
       Brand brand = brandRepository.findById(id).orElseThrow(() ->{
           return new DataNotFoundException("Not found brand with id " + id);
       });
       brand.setActive(false);
     return BrandResponse.fromBrand(brandRepository.save(brand));
    }

    @Override
    public List<BrandResponse> findAll() {
        List<Brand> categories = brandRepository.findAll();
        return categories.stream()
                .map(BrandResponse::fromBrand)
                .collect(Collectors.toList());}

    @Override
    public BrandResponse findByName(String name) {
        return BrandResponse.fromBrand( brandRepository.findByName(name).orElseThrow(() ->{
            return new DataNotFoundException("Not found brand with name " + name);
        }));
    }
}
