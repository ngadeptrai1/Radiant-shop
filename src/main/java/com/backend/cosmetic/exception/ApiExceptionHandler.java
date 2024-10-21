package com.backend.cosmetic.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.ZonedDateTime;
@RestControllerAdvice
public class ApiExceptionHandler {


    @ExceptionHandler(value = {
            IdNotFoundException.class
    })
    public ResponseEntity<?> handleApiRequestException(Exception ex){
        ApiException apiException =  new ApiException(
            ex.getMessage(),
            HttpStatus.BAD_REQUEST,
            ZonedDateTime.now()
            );
        return ResponseEntity.badRequest().body(apiException);
    }

    @ExceptionHandler(value ={UsernameNotFoundException.class,
            BadCredentialsException.class,
            DisabledException.class} )
    public ResponseEntity<?> handleAuthenticationException(Exception e){
        ApiException apiException =  new ApiException(
                e.getMessage(),
                HttpStatus.UNAUTHORIZED,
                ZonedDateTime.now()
        );
        return ResponseEntity.status(apiException.getStatus()).body(apiException);
    }

    @ExceptionHandler(value = {
            DataInvalidException.class
    })
    public ResponseEntity<?> handleDataInvalidException(DataInvalidException ex){
        ApiException apiException =  new ApiException(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST,
                ZonedDateTime.now()
        );
        return ResponseEntity.badRequest().body(apiException);
    }
    @ExceptionHandler(value = {
            DataNotFoundException.class
    })
    public ResponseEntity<?> handleDataNotFoundException(DataNotFoundException ex){
        ApiException apiException =  new ApiException(
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                ZonedDateTime.now()
        );
        return ResponseEntity.badRequest().body(apiException);
    }
    @ExceptionHandler(value = {
            DataPresentException.class
    })
    public ResponseEntity<?> DataPresentException(DataPresentException ex){
        ApiException apiException =  new ApiException(
                ex.getMessage(),
                HttpStatus.CONFLICT,
                ZonedDateTime.now()
        );
        return ResponseEntity.badRequest().body(apiException);
    }
    @ExceptionHandler(value = MethodArgumentTypeMismatchException.class )
    public ResponseEntity<?> convertFailedException(){
        ApiException apiException =  new ApiException(
                "Data invalid ",
                HttpStatus.BAD_REQUEST,
                ZonedDateTime.now()
        );
        return ResponseEntity.badRequest().body(apiException);
    }
    @ExceptionHandler(value = FileException.class )
    public ResponseEntity<?> fileException(FileException e){
        ApiException apiException =  new ApiException(
                e.getMessage(),
                e.getStatus(),
                ZonedDateTime.now()
        );
        return ResponseEntity.badRequest().body(apiException);
    }
}
