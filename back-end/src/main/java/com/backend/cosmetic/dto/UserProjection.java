package com.backend.cosmetic.dto;

import java.time.LocalDateTime;
import java.util.Set;

public interface UserProjection {
    Long getId();
    String getUsername();
    String getEmail();
    String getFullName();
    String getPhoneNumber();
    String getProvider();
    boolean isBlocked();
    boolean isEnabled();
    Set<String> getRoles();
    LocalDateTime getCreatedAt();
    LocalDateTime getUpdatedAt();
}
