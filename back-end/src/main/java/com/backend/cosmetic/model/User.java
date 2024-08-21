package com.backend.cosmetic.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Table(name = "users")
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class User extends BaseModel implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = false, nullable = true, length = 100)
    private String fullName;

    @Column(unique = false, nullable = true, length = 100)
    private String email;

    @Column(unique = true, nullable = true, length = 100)
    private String username;

    @Column(unique = false, nullable = true, length = 255)
    private String password;

    @Column(unique = false, nullable = true, length = 50)
    private String provider;

    @Column(unique = true, nullable = true, length = 100)
    private String providerId;

    private boolean blocked = false;

    private boolean enabled = true ;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.EMPTY_LIST;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !blocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    @Override
    public boolean isEnabled() {
        return enabled;
    }

}
