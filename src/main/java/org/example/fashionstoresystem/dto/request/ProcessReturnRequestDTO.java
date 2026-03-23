package org.example.fashionstoresystem.dto.request;

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
    private Long requestId;
    private ReturnStatus newStatus;
    private String rejectionReason;
}
