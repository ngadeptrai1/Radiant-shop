package com.backend.cosmetic.service;

import com.backend.cosmetic.dto.CategoryDTO;
import com.backend.cosmetic.model.Category;
import com.backend.cosmetic.response.CategoryResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public interface CategoryService {
    CategoryResponse findById(int id);
    CategoryResponse save (CategoryDTO category);
    CategoryResponse update( Integer id , CategoryDTO category);
    List<CategoryResponse> findAll();
    CategoryResponse findByName(String name);
    CategoryResponse delete(int id);
}
