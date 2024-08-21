package com.backend.cosmetic.security;

import com.backend.cosmetic.dto.TokenDto;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.service.UserManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
public class CustomOAuth2SuccessHandler  extends SimpleUrlAuthenticationSuccessHandler {
    @Autowired
    UserRepository userRepository;
    @Autowired
    TokenGenerator tokenGenerator;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException, IOException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId();
        String providerId = oAuth2User.getName();
        Authentication auth ;
        // Generate JWT token
       Optional<User> user = userRepository.findByProviderId(providerId);
       if (user.isEmpty()) {
           User newUser = new User();
           newUser.setProvider(provider);
           newUser.setProviderId(providerId);
           newUser.setEmail(oAuth2User.getAttribute("email"));
           newUser = userRepository.save(newUser);
         auth =  new UsernamePasswordAuthenticationToken(newUser, null, newUser.getAuthorities());
       }else {
           auth = new UsernamePasswordAuthenticationToken(user.get(), null, user.get().getAuthorities());
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
