package org.example.fashionstoresystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.ReturnStatus;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestResponseDTO {
    private Long requestId;
    private Long orderId;
    private String customerName;
    private String customerEmail;
    private ReturnStatus status;
    private String reason;
    private String description;
    private List<String> imageUrls;
    private Date requestDate;
    private String rejectionReason;
    private String paymentMethod;
    private List<ReturnItemDTO> items;
}
