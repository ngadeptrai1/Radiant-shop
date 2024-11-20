package com.backend.cosmetic.security;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.backend.cosmetic.dto.TokenDto;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.service.RoleService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TokenGenerator tokenGenerator;
    
    @Autowired
    private RoleService roleService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                      HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        String providerId = oAuth2User.getName();

        Authentication auth;
        Optional<User> userOpt = userRepository.findByProviderId(providerId);
        
        if (userOpt.isEmpty()) {
            User newUser = new User();
            newUser.setProvider(provider);
            newUser.setProviderId(providerId);
            newUser.setEmail(oAuth2User.getAttribute("email"));
            newUser.setFullName(oAuth2User.getAttribute("name"));
            // Set CUSTOMER role for OAuth2 users
            newUser.getRoles().add(roleService.getCustomerRole());
            
            newUser = userRepository.save(newUser);
            auth = new UsernamePasswordAuthenticationToken(newUser, null, newUser.getAuthorities());
        } else {
            auth = new UsernamePasswordAuthenticationToken(userOpt.get(), null, userOpt.get().getAuthorities());
        }
        
        TokenDto tokenDto = tokenGenerator.createToken(auth);
        // Save JWT in a secure HttpOnly cookie
        Cookie refreshToken = new Cookie("REFRESH_TOKEN", tokenDto.getRefreshToken());
        refreshToken.setHttpOnly(true);
        refreshToken.setSecure(true);
        refreshToken.setPath("/");
        response.addCookie(refreshToken);

        Cookie accessToken = new Cookie("ACCESS_TOKEN", tokenDto.getAccessToken());
        accessToken.setHttpOnly(true);
        accessToken.setSecure(true);
        accessToken.setPath("/");
        response.addCookie(accessToken);

        Cookie userId = new Cookie("USER_ID", tokenDto.getUserId().toString());
        userId.setHttpOnly(true);
        userId.setSecure(true);
        userId.setPath("/");
        response.addCookie(userId);
        // Redirect to frontend
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:4200/");
    }
}
