package org.example.fashionstoresystem.dto.request;

import jakarta.validation.constraints.NotNull;
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
    @NotNull(message = "Trạng thái không được để trống")
    private UserStatus status;
}
