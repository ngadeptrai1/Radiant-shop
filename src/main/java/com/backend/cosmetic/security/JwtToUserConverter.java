package com.backend.cosmetic.security;

import com.backend.cosmetic.model.User;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class JwtToUserConverter implements Converter<Jwt, UsernamePasswordAuthenticationToken> {
    @Override
    public UsernamePasswordAuthenticationToken convert(Jwt source) {
        User user = new User();
        user.setId(Long.parseLong( source.getSubject()));

        return new UsernamePasswordAuthenticationToken(user, source, Collections.EMPTY_LIST );
    }
}
