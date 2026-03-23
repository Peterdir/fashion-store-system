package org.example.fashionstoresystem.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.fashionstoresystem.entity.enums.PaymentMethod;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordOfflineSaleRequestDTO {
    private List<OfflineSaleItemDTO> items;
    private PaymentMethod paymentMethod;
    private String customerPhone; 

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OfflineSaleItemDTO {
        private Long productVariantId;
        private int quantity;
    }
}
