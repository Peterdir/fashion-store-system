package org.example.fashionstoresystem.service.offline_sale;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.RecordOfflineSaleRequestDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.OrderType;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.entity.jpa.ProductVariant;
import org.example.fashionstoresystem.repository.OrderItemRepository;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.example.fashionstoresystem.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class OfflineSaleServiceImpl implements OfflineSaleService {

    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    // Ghi nhận bán hàng trực tiếp
    @Override
    @Transactional
    public PlaceOrderResponseDTO recordOfflineSale(RecordOfflineSaleRequestDTO dto) {

        // Thiếu thông tin bắt buộc
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất một sản phẩm!");
        }
        if (dto.getPaymentMethod() == null) {
            throw new RuntimeException("Vui lòng chọn phương thức thanh toán!");
        }

        // Chọn sản phẩm & hiển thị thông tin
        // Kiểm tra tính hợp lệ của dữ liệu
        double totalAmount = 0.0;
        for (RecordOfflineSaleRequestDTO.OfflineSaleItemDTO item : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong hệ thống!"));

            // Số lượng vượt quá tồn kho
            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + variant.getProduct().getName()
                        + "' không đủ số lượng trong kho! (Tồn kho: " + variant.getStockQuantity() + ")");
            }
            if (item.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm phải lớn hơn 0!");
            }

            totalAmount += variant.getPrice() * item.getQuantity();
        }

        // Lưu giao dịch vào cơ sở dữ liệu
        Order order = Order.builder()
                .orderDate(new Date())
                .totalAmount(totalAmount)
                .paymentMethod(dto.getPaymentMethod())
                .type(OrderType.OFFLINE)
                .build();
        order = orderRepository.save(order);

        // Cập nhật tồn kho + Tạo OrderItem
        for (RecordOfflineSaleRequestDTO.OfflineSaleItemDTO item : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariantId()).get();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity((long) item.getQuantity())
                    .productName(variant.getProduct().getName())
                    .status(OrderStatus.COMPLETED) // Bán trực tiếp = hoàn thành ngay
                    .build();
            orderItemRepository.save(orderItem);

            // Trừ tồn kho
            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productVariantRepository.save(variant);
        }

        // Thông báo thành công
        return PlaceOrderResponseDTO.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(OrderStatus.COMPLETED)
                .message("Ghi nhận bán hàng trực tiếp thành công! Tổng tiền: " + totalAmount + "đ")
                .build();
    }
}
