package com.backend.cosmetic.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Table(name = "roles")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class Role {
    @Id
    private int id;

    @Column(unique = true, nullable = false,name = "role_name", length = 50)
    private String name;

    @Column(name = "description", length = 255)
    private String description;
}
