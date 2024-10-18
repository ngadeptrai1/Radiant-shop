package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "brands")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Brand extends BaseModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;

    @Column(name = "thumbnail",length = 500,nullable = false)
    private String thumbnail;
}
