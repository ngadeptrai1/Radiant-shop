package com.backend.cosmetic.rest;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.ChangePasswordDto;
import com.backend.cosmetic.dto.ForgotPasswordDto;
import com.backend.cosmetic.dto.LoginDto;
import com.backend.cosmetic.dto.ResetPasswordDto;
import com.backend.cosmetic.dto.SignUpDto;
import com.backend.cosmetic.dto.TokenDto;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.security.TokenGenerator;
import com.backend.cosmetic.service.UserManager;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("api/v1/auth")
public class AuthController {
    @Autowired
    UserDetailsManager userDetailsManager;
 
    @Autowired
    TokenGenerator tokenGenerator;

    @Autowired
    UserManager userManager;

    @Autowired
    DaoAuthenticationProvider authenticationProvider;

    @Autowired
    @Qualifier("jwtRefreshTokenProvider")
    JwtAuthenticationProvider refreshTokenProvider;
    
        @Autowired
    UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody SignUpDto signUpDto) {
        if (userDetailsManager.userExists(signUpDto.getUsername())) {
            return ResponseEntity
                .badRequest()
                .body("Username already exists");
        }
        
        User user = new User();
        user.setUsername(signUpDto.getUsername());
        user.setEmail(signUpDto.getEmail());
        user.setPassword(signUpDto.getPassword());
        user.setFullName(signUpDto.getFullName());
        userDetailsManager.createUser(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(user, signUpDto.getPassword(), Collections.emptyList());
    return ResponseEntity.ok(tokenGenerator.createToken(auth));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        try {
            Authentication auth = authenticationProvider.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                    loginDto.getUsername(),
                    loginDto.getPassword()
                )
            );
            return ResponseEntity.ok(tokenGenerator.createToken(auth));
        } catch (UsernameNotFoundException usernameNotFoundException) {
           throw new UsernameNotFoundException("Username or password incorrect");
        } catch (BadCredentialsException badCredentialsException) {
             throw new BadCredentialsException("Username or password incorrect");
        } catch (DisabledException Exception) {
             throw new DisabledException("Your account not active , please check your email to active accunt");
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> token(@RequestBody TokenDto tokenDto) {
        Authentication authentication = refreshTokenProvider.authenticate(
                new BearerTokenAuthenticationToken(tokenDto.getRefreshToken()));
        return ResponseEntity.ok(tokenGenerator.createToken(authentication));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable("id") Long id) {
        try {
            User user = userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                               .body("User not found with id: " + id);
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordDto changePasswordDto) {
        try {
            userDetailsManager.changePassword(changePasswordDto.getOldPassword(), changePasswordDto.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body("Invalid old password");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordDto forgotPasswordDto) {
        try {
            String resetToken = userManager.createPasswordResetToken(forgotPasswordDto.getEmail());
            // emailService.sendPasswordResetEmail(forgotPasswordDto.getEmail(), resetToken);
            return ResponseEntity.ok("Password reset instructions sent to your email");
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.badRequest().body("Email not found");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordDto resetPasswordDto) {
        try {
            userManager.resetPassword(resetPasswordDto.getToken(), resetPasswordDto.getNewPassword());
            return ResponseEntity.ok("Password has been reset successfully");
        } catch (DataInvalidException e) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsername(@PathVariable("username") String username) {
        if (userManager.checkUsername(username)) {
            return ResponseEntity.ok(true);
        }
        return ResponseEntity.ok(false);
    }




    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmail(@PathVariable("email") String email) {
        if (userManager.checkEmail(email)) {
            return ResponseEntity.ok(true);
        }
        return ResponseEntity.ok(false);
    }
}
