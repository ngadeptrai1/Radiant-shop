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
        return roleRepository.findByName(RoleType.CUSTOMER)
            .orElseThrow(() -> new RuntimeException("Customer role not found"));
    }

    public Role getStaffRole() {
        return roleRepository.findByName(RoleType.STAFF)
            .orElseThrow(() -> new RuntimeException("Staff role not found"));
    }
} 