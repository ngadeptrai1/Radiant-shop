package com.backend.cosmetic.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import com.backend.cosmetic.repository.RoleRepository;
import com.backend.cosmetic.service.RoleService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.dto.StaffCreateDto;
import com.backend.cosmetic.dto.UserResponseDto;
import com.backend.cosmetic.dto.UserUpdateDto;
import com.backend.cosmetic.dto.WalkInCustomerDto;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.mapper.UserMapper;
import com.backend.cosmetic.model.RoleType;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.service.UserManager;
import com.backend.cosmetic.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserManager userManager;
    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;

    @Override
    public List<UserResponseDto> getUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        return userMapper.toResponseDto(user);
    }

    @Override
    public UserResponseDto updateUser(Long id, UserUpdateDto updateDto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        
        user.setFullName(updateDto.getFullName());
        user.setPhoneNum(updateDto.getPhoneNumber());
        user.setEmail(updateDto.getEmail());
        user.setEnabled(updateDto.isEnabled());
        User updatedUser = userRepository.save(user);
        return userMapper.toResponseDto(updatedUser);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public UserResponseDto getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new DataNotFoundException("User not found"));
        return userMapper.toResponseDto(user);
    }

    @Override
    public UserResponseDto createWalkInCustomer(WalkInCustomerDto walkInCustomerDto) {
        User newUser = User.builder()
            .fullName(walkInCustomerDto.getFullName())
            .phoneNum(walkInCustomerDto.getPhoneNumber())
            .email(walkInCustomerDto.getEmail())
            .provider("WALK_IN")
            .enabled(true)
            .roles(new HashSet<>())
            .build();
        
        User savedUser = userManager.createWalkInCustomer(newUser);
        return userMapper.toResponseDto(savedUser);
    }

    @Override
    public List<UserResponseDto> searchCustomers(String phone, String name) {
        List<User> users;
        if (phone != null && !phone.isEmpty()) {
            users = userRepository.findByPhoneNumContaining(phone);
        } else if (name != null && !name.isEmpty()) {
            users = userRepository.findByFullNameContainingIgnoreCase(name);
        } else {
            users = userRepository.findAll();
        }
        
        return users.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDto> getUsersByRole(String roleName) {
        try {
            // Validate and convert string to RoleType enum
            RoleType roleType = RoleType.valueOf(roleName.toUpperCase());
            
            // Get users by role
            List<User> users = userRepository.findByRole(roleType);
            
            return users.stream()
                    .map(userMapper::toResponseDto)
                    .collect(Collectors.toList());
                    
        } catch (IllegalArgumentException e) {
            throw new DataNotFoundException("Invalid role: " + roleName);
        }
    }

    @Override
    public List<UserResponseDto> getUsersByRoles(List<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new IllegalArgumentException("Role names cannot be empty");
        }

        try {
            // Convert string role names to RoleType enum
            List<RoleType> roleTypes = roleNames.stream()
                    .map(name -> RoleType.valueOf(name.toUpperCase()))
                    .collect(Collectors.toList());
            

            return userMapper.toResponseDtoList( userRepository.findByRoles(roleTypes));
                    
        } catch (IllegalArgumentException e) {
            throw new DataNotFoundException("Invalid role name in list: " + roleNames);
        }
    }

    @Override
    public UserResponseDto createStaff(StaffCreateDto staffDto) {
        // Check if email already exists
        if (userRepository.existsByEmail(staffDto.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        User newStaff = User.builder()
            .fullName(staffDto.getFullName())
            .email(staffDto.getEmail())
            .username(staffDto.getUsername())
            .phoneNum(staffDto.getPhoneNumber())
            .password(staffDto.getPassword())
            .provider("local")
            .enabled(true)
            .roles(new HashSet<>())
            .build();
        
        // Xử lý role
        if (staffDto.getRole() != null && !staffDto.getRole().isEmpty()) {
            try {
                RoleType roleType = RoleType.valueOf(staffDto.getRole().toUpperCase());
                switch (roleType) {
                    case ADMIN:

                        newStaff.getRoles().add(roleService.getAdminRole());
                        break;
                    case STAFF:
                        newStaff.getRoles().add(roleService.getStaffRole());
                        break;
                    default:
                        throw new IllegalArgumentException("Invalid role");
                }
            } catch (IllegalArgumentException e) {
                // Nếu role không hợp lệ, mặc định là STAFF
                newStaff.getRoles().add(roleService.getStaffRole());
            }
        } else {
            // Nếu không có role được chỉ định, mặc định là STAFF
            newStaff.getRoles().add(roleService.getStaffRole());
        }
        
        User savedStaff = userManager.createStaffUser(newStaff);
        return userMapper.toResponseDto(savedStaff);
    }

    @Override
    public UserResponseDto updateStaff(Long id, StaffCreateDto staffDto) {
        User staff = userRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Staff not found"));
        ;

        // Update fields
        staff.setFullName(staffDto.getFullName());
        staff.setPhoneNum(staffDto.getPhoneNumber());

        // Only update email if it changed and isn't already taken
        if (!staff.getEmail().equals(staffDto.getEmail())) {
            if (userRepository.existsByEmail(staffDto.getEmail())) {
                throw new IllegalArgumentException("Email already exists");
            }
            staff.setEmail(staffDto.getEmail());
            staff.setUsername(staffDto.getEmail());

        }
        staff.setEnabled(staffDto.isEnabled());
        // Xử lý role
        if (staffDto.getRole() != null && !staffDto.getRole().isEmpty()) {
            try {
                RoleType roleType = RoleType.valueOf(staffDto.getRole().toUpperCase());

                // Xóa tất cả các role hiện tại
                staff.getRoles().clear();

                // Thêm role mới
                switch (roleType) {
                    case ADMIN:
                        staff.getRoles().add(roleService.getAdminRole());
                        break;
                    case STAFF:
                        staff.getRoles().add(roleService.getStaffRole());
                        break;
                    default:
                        throw new IllegalArgumentException("Invalid role");
                }
            } catch (IllegalArgumentException e) {
                // Nếu role không hợp lệ, mặc định là STAFF
                staff.getRoles().clear();
                staff.getRoles().add(roleService.getStaffRole());
            }
        } else {
            // Nếu không có role được chỉ định, mặc định là STAFF
            staff.getRoles().clear();
            staff.getRoles().add(roleService.getStaffRole());
        }

        User updatedStaff = userRepository.save(staff);
        return userMapper.toResponseDto(updatedStaff);
    }

    @Override
    public void deleteStaff(Long id) {
        User staff = userRepository.findById(id)
            .orElseThrow(() -> new DataNotFoundException("Staff not found"));
        
       staff.setEnabled(false);
       userRepository.save(staff);
    }

    @Override
    public List<UserResponseDto> searchStaff(String username, String email, String phone) {
        List<User> staffUsers = userRepository.searchStaff(username, email, phone);
        return staffUsers.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }
} 