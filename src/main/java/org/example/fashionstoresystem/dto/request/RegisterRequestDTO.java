package org.example.fashionstoresystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequestDTO {
    private String fullName;
    private String phone;
    private String email;
    private String password;
    private String confirmPassword;
}
