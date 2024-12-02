package com.backend.cosmetic.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findByName(String name);

    @EntityGraph(attributePaths = {"subCategories"})
    List<Category> findAll();

    @EntityGraph(attributePaths = {"subCategories"})
    List<Category> findAllByParentCategoryIsNull();

   
    Optional<Category> findParentCategoryById(Integer id);
}
