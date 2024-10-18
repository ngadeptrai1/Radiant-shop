package com.backend.cosmetic.service.impl;


import com.backend.cosmetic.dto.CategoryDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.exception.DataPresentException;
import com.backend.cosmetic.model.Category;
import com.backend.cosmetic.repository.CategoryRepository;
import com.backend.cosmetic.response.CategoryResponse;
import com.backend.cosmetic.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    @Override
    public CategoryResponse findById(int id) {
        return CategoryResponse.fromCategory( categoryRepository.findById(id).orElseThrow(() ->{
            return new DataNotFoundException("Not found category with id " + id);
        }));
    }

    @Override
    public CategoryResponse save(CategoryDTO category) {
        if (categoryRepository.findByName(category.getName()).isPresent()){
          throw new DataPresentException("Category with name "+ category.getName()+ " already exist ");
        }
        Category parentCate = categoryRepository.findById(category.getParentId()).orElseThrow(() ->{
            return new DataNotFoundException("Not found category parent with id " + category.getParentId());
        });
      Category newCate =  Category.builder()
                .name(category.getName())
                .parentCategory(parentCate)
                .build();
      newCate.setActive(category.isActivate());
        return CategoryResponse.fromCategory( categoryRepository.save(newCate));
    }

    @Override
    public CategoryResponse update( Integer id ,  CategoryDTO categoryUpdate) {
        Category category = categoryRepository.findById(id).orElseThrow(() ->{
            return new DataNotFoundException("Not found category with id " + id);
        });
        Category parentCate = categoryRepository.findById(categoryUpdate.getParentId()).orElseThrow(() ->{
            return new DataNotFoundException("Not found category parent with id " + categoryUpdate.getParentId());
        });
        category.setName(category.getName());
        category.setActive(category.isActive());
        category.setParentCategory(parentCate);
        return CategoryResponse.fromCategory( categoryRepository.save(category));
    }

    @Override
    public List<CategoryResponse> findAll(Pageable pageable) {
        List<Category> categories = categoryRepository.findAll(pageable).getContent();
        return categories.stream()
                .map(CategoryResponse::fromCategory)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse findByName(String name) {
        return CategoryResponse.fromCategory( categoryRepository.findByName(name).orElseThrow(() ->{
            return new DataNotFoundException("Not found category with name =  " + name);
        }));
    }

    @Override
    public void delete(int id) {
        try {
           Category category =  categoryRepository.findById(id).orElseThrow(() ->{
                return new DataNotFoundException("Not found category with id " + id);
            });
           categoryRepository.save(category);
        }catch (Exception ex){
            throw new DataNotFoundException(ex.getMessage());
        }
    }

}
