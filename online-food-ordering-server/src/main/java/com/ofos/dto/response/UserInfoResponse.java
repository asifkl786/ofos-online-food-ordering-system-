package com.ofos.dto.response;

import lombok.Data;

@Data
public class UserInfoResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profileImageUrl;
    private String role;
    private Boolean isActive;
}
