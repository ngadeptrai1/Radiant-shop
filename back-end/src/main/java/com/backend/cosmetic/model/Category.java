package com.backend.cosmetic.model;

import com.backend.cosmetic.dto.CategoryDTO;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Table(name = "categories")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Category extends BaseModel  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(length = 500, nullable = false, unique = true)
    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_id",nullable = true,referencedColumnName = "id")
    private Category parentCategory;

    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL)
    private List<Category> subCategories;
}
