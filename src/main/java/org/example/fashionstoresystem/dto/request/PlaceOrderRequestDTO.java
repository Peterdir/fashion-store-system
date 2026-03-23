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
public class PlaceOrderRequestDTO {
    private List<Long> cartItemIds;
    private String shippingAddress;
    private PaymentMethod paymentMethod;
    private String couponCode;
}
