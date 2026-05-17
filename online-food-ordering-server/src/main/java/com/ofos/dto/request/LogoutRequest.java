package com.ofos.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LogoutRequest {
    
    @NotBlank(message = "Access token is required")
    private String accessToken;
}
