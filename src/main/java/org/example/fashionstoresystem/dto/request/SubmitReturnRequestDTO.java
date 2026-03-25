package org.example.fashionstoresystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReturnRequestDTO {
    private Long orderId;
    private List<Long> itemIds;
    private String reason;
    private String description;
    private List<String> imageUrls;
}
