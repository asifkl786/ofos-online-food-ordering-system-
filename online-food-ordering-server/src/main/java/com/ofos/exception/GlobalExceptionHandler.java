package com.ofos.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
 
 @ExceptionHandler(AccessDeniedException.class)
 public ResponseEntity<ErrorResponse> handleAccessDeniedException(
         AccessDeniedException ex, WebRequest request) {
     log.warn("Access denied: {}", ex.getMessage());
     
     ErrorResponse errorResponse = ErrorResponse.builder()
             .timestamp(LocalDateTime.now())
             .status(HttpStatus.FORBIDDEN.value())
             .error(HttpStatus.FORBIDDEN.getReasonPhrase())
             .message("Access denied")
             .path(request.getDescription(false))
             .build();
     
     return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
 }
 
 @ExceptionHandler(ResourceNotFoundException.class)
 public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
         ResourceNotFoundException ex, WebRequest request) {
     log.error("Resource not found: {}", ex.getMessage());
     
     ErrorResponse errorResponse = ErrorResponse.builder()
             .timestamp(LocalDateTime.now())
             .status(HttpStatus.NOT_FOUND.value())
             .error(HttpStatus.NOT_FOUND.getReasonPhrase())
             .message(ex.getMessage())
             .path(request.getDescription(false))
             .build();
     
     return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
 }
 
 @ExceptionHandler(BusinessException.class)
 public ResponseEntity<ErrorResponse> handleBusinessException(
         BusinessException ex, WebRequest request) {
     log.warn("Business validation failed: {}", ex.getMessage());
     
     ErrorResponse errorResponse = ErrorResponse.builder()
             .timestamp(LocalDateTime.now())
             .status(HttpStatus.BAD_REQUEST.value())
             .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
             .message(ex.getMessage())
             .path(request.getDescription(false))
             .build();
     
     return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
 }
 
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<ErrorResponse> handleValidationExceptions(
         MethodArgumentNotValidException ex, WebRequest request) {
     log.error("Validation error: {}", ex.getMessage());
     
     Map<String, String> errors = new HashMap<>();
     ex.getBindingResult().getAllErrors().forEach(error -> {
         String fieldName = ((FieldError) error).getField();
         String errorMessage = error.getDefaultMessage();
         errors.put(fieldName, errorMessage);
     });
     
     ErrorResponse errorResponse = ErrorResponse.builder()
             .timestamp(LocalDateTime.now())
             .status(HttpStatus.BAD_REQUEST.value())
             .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
             .message("Validation failed")
             .validationErrors(errors)
             .path(request.getDescription(false))
             .build();
     
     return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
 }
 
 @ExceptionHandler(Exception.class)
 public ResponseEntity<ErrorResponse> handleGlobalException(
         Exception ex, WebRequest request) {
     log.error("Unexpected error occurred: ", ex);
     
     ErrorResponse errorResponse = ErrorResponse.builder()
             .timestamp(LocalDateTime.now())
             .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
             .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
             .message("An unexpected error occurred")
             .path(request.getDescription(false))
             .build();
     
     return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
 }
}
