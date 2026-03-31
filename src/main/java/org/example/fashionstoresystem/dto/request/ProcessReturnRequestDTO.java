package org.example.fashionstoresystem.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.ReturnStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessReturnRequestDTO {

    @NotNull(message = "Trạng thái mới không được để trống")
    private ReturnStatus newStatus;

    @Size(max = 500, message = "Lý do từ chối tối đa 500 ký tự")
    private String rejectionReason;
}
