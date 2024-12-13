package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "colors")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Color extends BaseModel {
    @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "hex_code", nullable = false)
    private String hexCode;

    private String name;
}
