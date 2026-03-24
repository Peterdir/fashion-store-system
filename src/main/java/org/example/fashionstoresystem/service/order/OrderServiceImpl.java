package org.example.fashionstoresystem.service.order;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.CancelOrderRequestDTO;
import org.example.fashionstoresystem.dto.request.PlaceOrderRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;
import org.example.fashionstoresystem.entity.enums.DiscountType;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.OrderType;
import org.example.fashionstoresystem.entity.enums.PaymentMethod;
import org.example.fashionstoresystem.entity.enums.RefundStatus;
import org.example.fashionstoresystem.entity.jpa.CartItem;
import org.example.fashionstoresystem.entity.jpa.Coupon;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.entity.jpa.OrderHistory;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.entity.jpa.ProductVariant;
import org.example.fashionstoresystem.repository.CartItemRepository;
import org.example.fashionstoresystem.repository.CouponRepository;
import org.example.fashionstoresystem.repository.OrderHistoryRepository;
import org.example.fashionstoresystem.repository.OrderItemRepository;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.example.fashionstoresystem.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;

    // ĐẶT HÀNG

    @Override
    @Transactional
    public PlaceOrderResponseDTO placeOrder(PlaceOrderRequestDTO dto) {

        // 1. Lấy danh sách sản phẩm trong giỏ hàng
        List<CartItem> cartItems = cartItemRepository.findAllById(dto.getCartItemIds());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng rỗng hoặc các mục đã bị xóa!");
        }

        // 2. Tính tổng tiền & Xác thực tồn kho
        double totalAmount = 0.0;
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Sản phẩm " + variant.getProduct().getName() + " không đủ số lượng tồn kho!");
            }
            totalAmount += variant.getPrice() * item.getQuantity();
        }

        // 3. Áp dụng mã giảm giá (Nếu có)
        if (dto.getCouponCode() != null && !dto.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(dto.getCouponCode().trim())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã bị khóa!"));

            if (coupon.getExpiryDate().isBefore(Instant.now()) ||
                    coupon.getStartDate().isAfter(Instant.now())) {
                throw new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
            }

            if (coupon.getMinOrderAmount() != null && totalAmount < coupon.getMinOrderAmount()) {
                throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá này!");
            }

            if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
                totalAmount -= totalAmount * (coupon.getDiscountValue() / 100.0);
            } else {
                totalAmount -= coupon.getDiscountValue();
            }

            if (totalAmount < 0) totalAmount = 0.0;
        }

        // 4. Khởi tạo & Lưu Object Order chính
        Order order = new Order();
        order.setOrderDate(new Date());
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setShippingAddress(dto.getShippingAddress());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setType(OrderType.ONLINE);
        order = orderRepository.save(order);

        // 5. Khởi tạo OrderItem và Trừ Kho
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity((long) item.getQuantity())
                    .price(variant.getPrice())
                    .productName(variant.getProduct().getName())
                    .build();
            orderItemRepository.save(orderItem);

            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productVariantRepository.save(variant);
        }

        // 6. Xóa các mục này khỏi giỏ hàng
        cartItemRepository.deleteAll(cartItems);

        // 7. Trả về kết quả
        return PlaceOrderResponseDTO.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .message("Đặt hàng thành công! Đang chuyển hướng sang trang thanh toán...")
                .build();
    }

    // THEO DÕI TRẠNG THÁI ĐƠN HÀNG - Xem danh sách

    @Override
    public List<OrderSummaryResponseDTO> getMyOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);

        // Không có đơn hàng → trả về list rỗng
        return orders.stream()
                .map(order -> OrderSummaryResponseDTO.builder()
                        .orderId(order.getId())
                        .orderDate(order.getOrderDate())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getStatus())
                        .paymentMethod(order.getPaymentMethod())
                        .itemCount(order.getOrderItems().size())
                        .build())
                .toList();
    }

    // THEO DÕI TRẠNG THÁI ĐƠN HÀNG - Xem chi tiết

    @Override
    public OrderDetailResponseDTO getMyOrderDetail(Long userId, Long orderId) {
        // Đơn hàng không tồn tại hoặc không thuộc về khách hàng
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn!"));

        List<OrderDetailResponseDTO.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> OrderDetailResponseDTO.OrderItemDTO.builder()
                        .orderItemId(item.getId())
                        .productName(item.getProductName())
                        .size(item.getProductVariant() != null ? item.getProductVariant().getSize() : null)
                        .color(item.getProductVariant() != null ? item.getProductVariant().getColor() : null)
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .toList();

        List<OrderDetailResponseDTO.OrderHistoryDTO> historyDTOs = order.getOrderHistories().stream()
                .map(h -> OrderDetailResponseDTO.OrderHistoryDTO.builder()
                        .previousStatus(h.getPreviousStatus())
                        .newStatus(h.getNewStatus())
                        .changeDate(h.getChangeDate())
                        .build())
                .toList();

        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .cancellationReason(order.getCancellationReason())
                .refundStatus(order.getRefundStatus())
                .items(itemDTOs)
                .histories(historyDTOs)
                .build();
    }

    // HỦY ĐƠN HÀNG

    @Override
    @Transactional
    public MessageResponseDTO cancelOrder(Long userId, CancelOrderRequestDTO dto) {
        // Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu
        Order order = orderRepository.findByIdAndUserId(dto.getOrderId(), userId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn!"));

        // Đơn hàng không đủ điều kiện hủy
        Set<OrderStatus> cancellableStatuses = Set.of(
                OrderStatus.PENDING_PAYMENT,
                OrderStatus.PAID,
                OrderStatus.PROCESSING
        );

        if (!cancellableStatuses.contains(order.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái " + order.getStatus() +
                    ". Chỉ có thể hủy đơn hàng Chờ thanh toán, Đã thanh toán hoặc Đang xử lý.");
        }

        OrderStatus previousStatus = order.getStatus();

        // Cập nhật trạng thái đơn hàng sang Đã hủy
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(dto.getCancellationReason());

        // Nếu đơn hàng đã thanh toán online → khởi tạo hoàn tiền
        if (previousStatus == OrderStatus.PAID && order.getPaymentMethod() != PaymentMethod.COD) {
            try {
                // Khởi tạo yêu cầu hoàn tiền đến cổng thanh toán
                order.setRefundStatus(RefundStatus.PENDING);
            } catch (Exception e) {
                // Lỗi khi hoàn tiền
                order.setRefundStatus(RefundStatus.FAILED);
            }
        }

        orderRepository.save(order);

        // Lưu lịch sử chuyển trạng thái
        OrderHistory history = OrderHistory.builder()
                .order(order)
                .previousStatus(previousStatus)
                .newStatus(OrderStatus.CANCELLED)
                .changeDate(new Date())
                .build();
        orderHistoryRepository.save(history);

        // Hoàn lại tồn kho
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProductVariant() != null) {
                ProductVariant variant = item.getProductVariant();
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity().intValue());
                productVariantRepository.save(variant);
            }
        }

        String message = "Hủy đơn hàng thành công!";
        if (order.getRefundStatus() == RefundStatus.PENDING) {
            message += " Yêu cầu hoàn tiền đang được xử lý.";
        } else if (order.getRefundStatus() == RefundStatus.FAILED) {
            message += " Lỗi khi hoàn tiền, vui lòng liên hệ hỗ trợ.";
        }

        return MessageResponseDTO.builder()
                .message(message)
                .build();
    }
}
