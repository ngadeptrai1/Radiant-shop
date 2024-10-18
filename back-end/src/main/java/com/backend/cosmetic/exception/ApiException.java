package com.backend.cosmetic.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.time.ZonedDateTime;

@AllArgsConstructor
@Getter
@Setter
public class ApiException {
    private final Object message ;
    private final HttpStatus status;
    private final ZonedDateTime timestamp;
}
