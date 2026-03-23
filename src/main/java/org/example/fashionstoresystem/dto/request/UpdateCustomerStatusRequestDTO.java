package org.example.fashionstoresystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.UserStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCustomerStatusRequestDTO {
    private Long userId;
    private UserStatus status;
}
