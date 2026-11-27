package com.civictrack.controller;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(NoSuchElementException.class) @ResponseStatus(HttpStatus.NOT_FOUND)
 public Map<String,String> missing(Exception e){return Map.of("error",e.getMessage());}
 @ExceptionHandler({IllegalArgumentException.class}) @ResponseStatus(HttpStatus.BAD_REQUEST)
 public Map<String,String> bad(Exception e){return Map.of("error",e.getMessage());}
}
