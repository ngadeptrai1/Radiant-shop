package com.backend.cosmetic.security;


import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@Slf4j
public class WebConfig {

    @Autowired
    JwtToUserConverter jwtToUserConverter;

    @Autowired
    KeyUtils keyUtils;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    UserDetailsManager userDetailsManager;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, OAuth2AuthorizedClientRepository authorizedClientRepository) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeRequests(authorized -> authorized
                        .requestMatchers("api/auth/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(customOAuth2SuccessHandler())
                )
                .oauth2ResourceServer((oauth2)->
                    oauth2.jwt((jwt)->jwt.jwtAuthenticationConverter(jwtToUserConverter))
                )
                .sessionManagement((session)->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling((exceptions)->exceptions
                        .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                        .accessDeniedHandler(new BearerTokenAccessDeniedHandler()));
        return http.build();
    }
@Bean
CustomOAuth2SuccessHandler customOAuth2SuccessHandler(){
        return new CustomOAuth2SuccessHandler();
}


    @Bean
    @Primary
   public JwtDecoder jwtAccessTokenDecoder(KeyUtils keyUtils){
        return NimbusJwtDecoder.withPublicKey(keyUtils.getAccessTokenPublicKey()).build();
    }

    @Bean
    @Primary
   public JwtEncoder jwtAccessTokenEncoder(KeyUtils keyUtils){
        JWK jwk = new RSAKey.Builder(keyUtils.getAccessTokenPublicKey())
                .privateKey(keyUtils.getAccessTokenPrivateKey())
                .build();
        JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwks);
    }

    @Bean
    @Qualifier("jwtRefreshTokenDecoder")
    public JwtDecoder jwtRefreshTokenDecoder(){
        return NimbusJwtDecoder.withPublicKey(keyUtils.getRefreshTokenPublicKey()).build();
    }
    @Bean
    @Qualifier("jwtRefreshTokenEncoder")
   public JwtEncoder jwtRefreshTokenEncoder(){
        JWK jwk = new RSAKey.Builder(keyUtils.getRefreshTokenPublicKey())
                .privateKey(keyUtils.getRefreshTokenPrivateKey())
                .build();
    JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
    return new NimbusJwtEncoder(jwks);
    }

    @Bean
    @Qualifier("jwtRefreshTokenProvider")
   public JwtAuthenticationProvider jwtRefreshTokenProvider(){
        JwtAuthenticationProvider provider = new JwtAuthenticationProvider(jwtRefreshTokenDecoder());
        provider.setJwtAuthenticationConverter(jwtToUserConverter);
        return provider;
    }

    @Bean
    DaoAuthenticationProvider daoAuthenticationProvider(){
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder);
        provider.setUserDetailsService(userDetailsManager);
        return provider;
    }
}
