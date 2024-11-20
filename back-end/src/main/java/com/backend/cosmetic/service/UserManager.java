package com.backend.cosmetic.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.UserRepository;

@Service
public class UserManager implements UserDetailsManager {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    RoleService roleService;

    @Override
    public void createUser(UserDetails user) {
        User newUser = (User) user;
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        
        // Set default role as CUSTOMER for self-registration
        newUser.getRoles().add(roleService.getCustomerRole());
        
        userRepository.save(newUser);
    }

    public void createStaffUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Set STAFF role for users created by admin
        user.getRoles().add(roleService.getStaffRole());
        userRepository.save(user);
    }

    public void createOauth2User(User user) {
        // Set default role as CUSTOMER for OAuth2 users
        user.getRoles().add(roleService.getCustomerRole());
        userRepository.save(user);
    }

    @Override
    public void updateUser(UserDetails user) {
        User existingUser = userRepository.findByUsername(user.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        User newUser = (User) user;
        existingUser.setFullName(newUser.getFullName());
        existingUser.setEmail(newUser.getEmail());
        existingUser.setPhoneNum(newUser.getPhoneNum());
        
        userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public void changePassword(String oldPassword, String newPassword) {
        // Get the currently authenticated user
        Authentication currentUser = SecurityContextHolder.getContext().getAuthentication();
        String username = currentUser.getName();

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadCredentialsException("Invalid old password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public boolean userExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).orElseThrow(()->new UsernameNotFoundException("User not found"));
    }

    public User getUserByProviderId(String providerId) {
        return userRepository.findByProviderId(providerId).orElseThrow(()->new UsernameNotFoundException("User not found"));
    }

    public User createWalkInCustomer(User user) {
        // Set CUSTOMER role
        user.getRoles().add(roleService.getCustomerRole());
        
        // Generate a unique username based on phone number if not exists
        if (user.getUsername() == null) {
            String baseUsername = "CUST_" + user.getPhoneNum();
            String username = baseUsername;
            int counter = 1;
            
            while (userExists(username)) {
                username = baseUsername + "_" + counter++;
            }
            user.setUsername(username);
        }
        
        return userRepository.save(user);
    }
}
