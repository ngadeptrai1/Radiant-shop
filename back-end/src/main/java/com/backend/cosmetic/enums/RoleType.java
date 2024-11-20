package com.backend.cosmetic.enums;

public enum RoleType {
    ADMIN("ROLE_ADMIN"),
    STAFF("ROLE_STAFF"),
    CUSTOMER("ROLE_CUSTOMER");

    private final String value;

    RoleType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
} 