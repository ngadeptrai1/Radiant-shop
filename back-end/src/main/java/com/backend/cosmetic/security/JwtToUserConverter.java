package com.backend.cosmetic.security;

import com.backend.cosmetic.model.User;
import com.backend.cosmetic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtToUserConverter implements Converter<Jwt, UsernamePasswordAuthenticationToken> {
    private final UserRepository userRepository;
    @Override
    public UsernamePasswordAuthenticationToken convert(Jwt source) {

        User user = userRepository.findById(Long.parseLong( source.getSubject())).get();

        return new UsernamePasswordAuthenticationToken(user, source, user.getAuthorities() );
    }
}
