package com.backend.cosmetic.exception;

import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
public class FileException extends RuntimeException{
   private HttpStatus status;
   private String message;
    public FileException(String message ,HttpStatus status){
        this.status = status;
       this.message = message;
    }
}
