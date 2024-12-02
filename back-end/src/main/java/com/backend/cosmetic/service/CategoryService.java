package com.backend.cosmetic.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.CategoryDTO;
import com.backend.cosmetic.model.Category;
import com.backend.cosmetic.response.CategoryResponse;

@Service
public interface CategoryService {
    CategoryResponse findById(int id);
    CategoryResponse save (CategoryDTO category);
    CategoryResponse update( Integer id , CategoryDTO category);
    List<CategoryResponse> findAll();
    CategoryResponse findByName(String name);
    CategoryResponse delete(int id);
    List<Category> findAllParents();
    Category findParentCategoryById(Integer id);
}
