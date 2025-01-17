package com.backend.cosmetic.security;

import java.text.MessageFormat;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import com.backend.cosmetic.dto.TokenDto;
import com.backend.cosmetic.model.User;

@Component
public class TokenGenerator {

    @Autowired
    JwtEncoder accessTokenEncoder;

    @Autowired
    @Qualifier("jwtRefreshTokenEncoder")
    JwtEncoder refreshTokenEncoder;

    private String createAccessToken(Authentication authentication) {
        User user  = (User) authentication.getPrincipal();
        Instant now = Instant.now();
        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .issuer("myApp")
                .issuedAt(now)
                .claim("roles", authentication.getAuthorities())
                .expiresAt(now.plus(50, ChronoUnit.MINUTES))
                .subject(user.getId()+"")
                .build();
    return accessTokenEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();
    }
    private String createRefreshToken(Authentication authentication) {
        User user  = (User) authentication.getPrincipal();
        Instant now = Instant.now();

        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
                .issuer("myApp")
                .issuedAt(now)
                .expiresAt(now.plus(30, ChronoUnit.DAYS))
                .subject(user.getId()+"")
                .build();
    return refreshTokenEncoder.encode(JwtEncoderParameters.from(claimsSet)).getTokenValue();
    }

    public TokenDto createToken(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof User user) ) {
            throw new BadCredentialsException(
                    MessageFormat.format("Principal {0} is not User type", authentication.getPrincipal().getClass()));
        }

        TokenDto tokenDto = new TokenDto();
        tokenDto.setUserId(user.getId());
        tokenDto.setAccessToken(createAccessToken(authentication));
        tokenDto.setRefreshToken(createRefreshToken(authentication));
        String refreshToken ;
        if(authentication.getCredentials() instanceof Jwt jwt) {
            Instant now = Instant.now();
            Instant expiresAt =  jwt.getExpiresAt();
            Duration duration  = Duration.between(now, expiresAt);

            long dayUntilExpired = duration.toDays();

            if(dayUntilExpired < 7) {
                refreshToken = createRefreshToken(authentication);
            }else{
                refreshToken = jwt.getTokenValue();

            }
        }else{
            refreshToken = createRefreshToken(authentication);
        }
        tokenDto.setRefreshToken(refreshToken);
        return tokenDto;
    }

}
