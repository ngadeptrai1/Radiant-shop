package com.backend.cosmetic.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.cosmetic.model.Role;
import com.backend.cosmetic.model.RoleType;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleType name);
} 