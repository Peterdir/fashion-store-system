package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.UserStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerSummaryResponseDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private UserStatus status;
}
