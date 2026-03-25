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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

        // 4. Khởi tạo & Lưu Object Order chính (không còn status ở Order)
        Order order = new Order();
        order.setOrderDate(new Date());
        order.setTotalAmount(totalAmount);
        order.setShippingAddress(dto.getShippingAddress());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setType(OrderType.ONLINE);
        order = orderRepository.save(order);

        // 5. Khởi tạo OrderItem (mỗi item có status riêng) và Trừ Kho
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity((long) item.getQuantity())
                    .productName(variant.getProduct().getName())
                    .status(OrderStatus.PENDING_PAYMENT) // Trạng thái ban đầu ở item
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
                .status(OrderStatus.PENDING_PAYMENT) // Tất cả item cùng status lúc đặt
                .message("Đặt hàng thành công! Đang chuyển hướng sang trang thanh toán...")
                .build();
    }

    // THEO DÕI TRẠNG THÁI ĐƠN HÀNG - Xem danh sách

    @Override
    public Page<OrderSummaryResponseDTO> getMyOrders(Long userId, OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.searchMyOrders(userId, status, pageable);

        return orders
                .map(order -> {
                    // Tổng hợp trạng thái từ các OrderItem
                    Map<String, Integer> statusSummary = order.getOrderItems().stream()
                            .collect(Collectors.groupingBy(
                                    item -> item.getStatus().name(),
                                    LinkedHashMap::new,
                                    Collectors.summingInt(i -> 1)
                            ));

                    return OrderSummaryResponseDTO.builder()
                            .orderId(order.getId())
                            .orderDate(order.getOrderDate())
                            .totalAmount(order.getTotalAmount())
                            .paymentMethod(order.getPaymentMethod())
                            .itemCount(order.getOrderItems().size())
                            .statusSummary(statusSummary)
                            .build();
                });
    }

    // THEO DÕI TRẠNG THÁI ĐƠN HÀNG - Xem chi tiết

    @Override
    public OrderDetailResponseDTO getMyOrderDetail(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn!"));

        List<OrderDetailResponseDTO.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    List<OrderDetailResponseDTO.OrderHistoryDTO> historyDTOs = item.getOrderHistories().stream()
                            .map(h -> OrderDetailResponseDTO.OrderHistoryDTO.builder()
                                    .previousStatus(h.getPreviousStatus())
                                    .newStatus(h.getNewStatus())
                                    .changeDate(h.getChangeDate())
                                    .build())
                            .toList();

                    return OrderDetailResponseDTO.OrderItemDTO.builder()
                            .orderItemId(item.getId())
                            .productName(item.getProductName())
                            .size(item.getProductVariant() != null ? item.getProductVariant().getSize() : null)
                            .color(item.getProductVariant() != null ? item.getProductVariant().getColor() : null)
                            .quantity(item.getQuantity())
                            .price(item.getProductVariant() != null ? item.getProductVariant().getPrice() : 0.0)
                            .status(item.getStatus())
                            .refundStatus(item.getRefundStatus())
                            .cancellationReason(item.getCancellationReason())
                            .histories(historyDTOs)
                            .build();
                })
                .toList();

        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .items(itemDTOs)
                .build();
    }

    // HỦY ĐƠN HÀNG

    @Override
    @Transactional
    public MessageResponseDTO cancelOrder(Long userId, Long orderId, CancelOrderRequestDTO dto) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn!"));

        Set<OrderStatus> cancellableStatuses = Set.of(
                OrderStatus.PENDING_PAYMENT,
                OrderStatus.PAID,
                OrderStatus.PROCESSING
        );

        boolean hasRefund = false;
        boolean refundFailed = false;

        for (OrderItem item : order.getOrderItems()) {
            if (!cancellableStatuses.contains(item.getStatus())) {
                throw new RuntimeException("Sản phẩm '" + item.getProductName() + "' ở trạng thái "
                        + item.getStatus() + " không thể hủy!");
            }

            OrderStatus previousStatus = item.getStatus();

            // Nếu item đã thanh toán online → hoàn tiền
            if (previousStatus == OrderStatus.PAID && order.getPaymentMethod() != PaymentMethod.COD) {
                try {
                    item.setRefundStatus(RefundStatus.PENDING);
                    hasRefund = true;
                } catch (Exception e) {
                    item.setRefundStatus(RefundStatus.FAILED);
                    refundFailed = true;
                }
            }

            item.setStatus(OrderStatus.CANCELLED);
            item.setCancellationReason(dto.getCancellationReason());
            orderItemRepository.save(item);

            // Lưu lịch sử chuyển trạng thái
            OrderHistory history = OrderHistory.builder()
                    .orderItem(item)
                    .previousStatus(previousStatus)
                    .newStatus(OrderStatus.CANCELLED)
                    .changeDate(new Date())
                    .build();
            orderHistoryRepository.save(history);

            // Hoàn lại tồn kho
            if (item.getProductVariant() != null) {
                ProductVariant variant = item.getProductVariant();
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity().intValue());
                productVariantRepository.save(variant);
            }
        }

        String message = "Hủy đơn hàng thành công!";
        if (hasRefund && !refundFailed) {
            message += " Yêu cầu hoàn tiền đang được xử lý.";
        } else if (refundFailed) {
            message += " Lỗi khi hoàn tiền một số sản phẩm, vui lòng liên hệ hỗ trợ.";
        }

        return MessageResponseDTO.builder()
                .message(message)
                .build();
    }
}
