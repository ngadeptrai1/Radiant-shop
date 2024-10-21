//package com.backend.cosmetic.rest;
//
//import com.backend.cosmetic.dto.LoginDto;
//import com.backend.cosmetic.dto.SignUpDto;
//import com.backend.cosmetic.dto.TokenDto;
//import com.backend.cosmetic.model.User;
//import com.backend.cosmetic.security.TokenGenerator;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
//import org.springframework.security.core.Authentication;
////import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;
////import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
//import org.springframework.security.provisioning.UserDetailsManager;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.Collections;
//
//@Slf4j
//@RestController
//@RequestMapping("api/auth")
//public class AuthController {
//    @Autowired
//    UserDetailsManager userDetailsManager;
//
//    @Autowired
//    TokenGenerator tokenGenerator;
//
//    @Autowired
//    DaoAuthenticationProvider authenticationProvider;
//
//    @Autowired
//    @Qualifier("jwtRefreshTokenProvider")
//    JwtAuthenticationProvider refreshTokenProvider;
//
//    @PostMapping("/")
//    public ResponseEntity<?> register(@RequestBody SignUpDto signUpDto) {
//        User user = new User();
//        user.setUsername(signUpDto.getUsername());
//        user.setEmail(signUpDto.getEmail());
//        user.setPassword(signUpDto.getPassword());
//        user.setFullName(signUpDto.getFullName());
//        userDetailsManager.createUser(user);
//        Authentication auth = new UsernamePasswordAuthenticationToken(user, signUpDto.getPassword(), Collections.emptyList());
//    return ResponseEntity.ok(tokenGenerator.createToken(auth));
//    }
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
//        log.info("Login request received");
//    Authentication auth = authenticationProvider.
//            authenticate(UsernamePasswordAuthenticationToken.unauthenticated(loginDto.getUserName(),loginDto.getPassword()));
//    return ResponseEntity.ok(tokenGenerator.createToken(auth));
//    }
//
//    @PostMapping("/token")
//    public ResponseEntity<?> token(@RequestBody TokenDto tokenDto) {
//        Authentication authentication = refreshTokenProvider.authenticate(
//                new BearerTokenAuthenticationToken(tokenDto.getRefreshToken()));
//        return ResponseEntity.ok(tokenGenerator.createToken(authentication));
//    }
//
//}
