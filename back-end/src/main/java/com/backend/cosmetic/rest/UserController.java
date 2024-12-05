package com.backend.cosmetic.rest;

import java.util.List;

import com.backend.cosmetic.mapper.UserMapper;
import com.backend.cosmetic.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.StaffCreateDto;
import com.backend.cosmetic.dto.UserResponseDto;
import com.backend.cosmetic.dto.UserUpdateDto;
import com.backend.cosmetic.dto.WalkInCustomerDto;
import com.backend.cosmetic.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody @Valid UserUpdateDto updateDto) {
        return ResponseEntity.ok(userService.updateUser(id, updateDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PostMapping("/walk-in")
    public ResponseEntity<?> createWalkInCustomer(@RequestBody @Valid WalkInCustomerDto walkInCustomerDto) {
        return ResponseEntity.ok(userService.createWalkInCustomer(walkInCustomerDto));
    }
    

    @GetMapping("/search")
    public ResponseEntity<?> searchCustomers(
        @RequestParam(required = false) String phone,
        @RequestParam(required = false) String name
    ) {
        return ResponseEntity.ok(userService.searchCustomers(phone, name));
    }

    @GetMapping("/role/{roleName}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String roleName) {
        try {
            List<UserResponseDto> users = userService.getUsersByRole(roleName);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getUsersByRoles(@RequestParam List<String> roleNames) {
        try {
            List<UserResponseDto> users = userService.getUsersByRoles(roleNames);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody @Valid StaffCreateDto staffDto) {
        return ResponseEntity.ok(userService.createStaff(staffDto));
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody @Valid StaffCreateDto staffDto) {
        return ResponseEntity.ok(userService.updateStaff(id, staffDto));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        userService.deleteStaff(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/staff/search")
    public ResponseEntity<?> searchStaff(
        @RequestParam(required = false) String username,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String phone
    ) {
        try {
            List<UserResponseDto> staff = userService.searchStaff(username, email, phone);
            return ResponseEntity.ok(staff);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/customer")
    public ResponseEntity<?> getCustomers() {
        return ResponseEntity.ok(userRepository.findAllCustomers());
    }
    
}
