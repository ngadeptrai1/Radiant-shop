package com.backend.cosmetic.service;

import org.springframework.stereotype.Service;

import com.backend.cosmetic.model.Role;
import com.backend.cosmetic.model.RoleType;
import com.backend.cosmetic.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    public Role getCustomerRole() {
        return roleRepository.findByNameLike(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("Customer role not found"));
    }

    public Role getStaffRole() {
        return roleRepository.findByNameLike(RoleType.STAFF)
            .orElseThrow(() -> new RuntimeException("Staff role not found"));
    }
    public Role getAdminRole() {
        return roleRepository.findByNameLike(RoleType.ADMIN)
                .orElseThrow(() -> new RuntimeException("Staff role not found"));
    }
} 