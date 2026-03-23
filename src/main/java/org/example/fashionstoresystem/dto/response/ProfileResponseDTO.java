package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.Role;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponseDTO {
    private Long userId;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private Role role;
}
