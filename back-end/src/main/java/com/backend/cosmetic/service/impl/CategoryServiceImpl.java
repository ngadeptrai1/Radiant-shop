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

import java.util.HashSet;
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
        }),new HashSet<>());
    }

    @Override
    public CategoryResponse save(CategoryDTO category) {
        if (categoryRepository.findByName(category.getName()).isPresent()){
          throw new DataPresentException("Category with name "+ category.getName()+ " already exist ");
        }
        Category categoryEntity = new Category();
        if(category.getParentId()!= null){
            Category parentCate = categoryRepository.findById(category.getParentId()).orElseThrow(() ->{
                return new DataNotFoundException("Not found category parent with id " + category.getParentId());
            });
            categoryEntity.setParentCategory(parentCate);
            categoryEntity.setName(category.getName());
        }else{
            categoryEntity.setName(category.getName());
        }
      categoryEntity.setActive(category.isActivate());
        return CategoryResponse.fromCategory( categoryRepository.save(categoryEntity),new HashSet<>());
    }

    @Override
    public CategoryResponse update( Integer id ,  CategoryDTO categoryUpdate) {
        Category category = categoryRepository.findById(id).orElseThrow(() ->{
            return new DataNotFoundException("Not found category with id " + id);
        });
        if(categoryUpdate.getParentId()!=null){
            Category parentCate = categoryRepository.findById(categoryUpdate.getParentId()).orElseThrow(() ->{
                return new DataNotFoundException("Not found category parent with id " + categoryUpdate.getParentId());
            });
            category.setParentCategory(parentCate);
        }else{
            category.setParentCategory(null);
        }
        category.setName(categoryUpdate.getName());
        category.setActive(categoryUpdate.isActivate());

        return CategoryResponse.fromCategory( categoryRepository.save(category),new HashSet<>());
    }

    @Override
    public List<CategoryResponse> findAll() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> {return CategoryResponse.fromCategory(category,new HashSet<>());})
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse findByName(String name) {
        return CategoryResponse.fromCategory( categoryRepository.findByName(name).orElseThrow(() ->{
            return new DataNotFoundException("Not found category with name =  " + name);
        }),new HashSet<>());
    }

    @Override
    public CategoryResponse delete(int id) {
        try {
           Category category =  categoryRepository.findById(id).orElseThrow(() ->{
                return new DataNotFoundException("Not found category with id " + id);
            });
           category.setActive(false);
          return CategoryResponse.fromCategory( categoryRepository.save(category),new HashSet<>());
        }catch (Exception ex){
            throw new DataNotFoundException(ex.getMessage());
        }
    }

}
