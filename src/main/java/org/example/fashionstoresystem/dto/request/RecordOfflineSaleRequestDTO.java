package org.example.fashionstoresystem.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    @NotEmpty(message = "Phải có ít nhất một sản phẩm")
    @Valid
    private List<OfflineSaleItemDTO> items;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0")
    private String customerPhone; 

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OfflineSaleItemDTO {
        @NotNull(message = "ID biến thể sản phẩm không được để trống")
        private Long productVariantId;

        @Min(value = 1, message = "Số lượng phải ít nhất là 1")
        private int quantity;
    }
}
