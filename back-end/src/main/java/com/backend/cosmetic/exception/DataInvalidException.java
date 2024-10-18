package com.backend.cosmetic.exception;

import lombok.Data;

@Data
public class DataInvalidException extends RuntimeException {

    public DataInvalidException(String message ){
        super(message);
    }
}
