package com.backend.cosmetic.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.model.PasswordResetToken;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.PasswordResetTokenRepository;
import com.backend.cosmetic.repository.UserRepository;

@Service
public class UserManager implements UserDetailsManager {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    RoleService roleService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Override
    public void createUser(UserDetails user) {
        User newUser = (User) user;
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        
        // Set default role as CUSTOMER for self-registration
        newUser.getRoles().add(roleService.getCustomerRole());
        
        userRepository.save(newUser);
    }

    public User createStaffUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Chỉ thêm role STAFF nếu user chưa có role nào
        if (user.getRoles().isEmpty()) {
            user.getRoles().add(roleService.getStaffRole());
        }
        return userRepository.save(user);
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

    public String createPasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        String token = UUID.randomUUID().toString();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        
        passwordResetTokenRepository.save(passwordResetToken);
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
            .orElseThrow(() -> new DataNotFoundException("Invalid token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new DataNotFoundException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        passwordResetTokenRepository.delete(resetToken);
    }

    public boolean checkUsername(String username) {
           return userRepository.findByUsername(username).isPresent();
    }

    public boolean checkEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
}
