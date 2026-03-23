package org.example.fashionstoresystem.service.order;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.PlaceOrderRequestDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;
import org.example.fashionstoresystem.entity.enums.DiscountType;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.OrderType;
import org.example.fashionstoresystem.entity.jpa.CartItem;
import org.example.fashionstoresystem.entity.jpa.Coupon;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.entity.jpa.ProductVariant;
import org.example.fashionstoresystem.repository.CartItemRepository;
import org.example.fashionstoresystem.repository.CouponRepository;
import org.example.fashionstoresystem.repository.OrderItemRepository;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.example.fashionstoresystem.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;

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

            // Validate khoảng thời gian
            if (coupon.getExpiryDate().isBefore(Instant.now()) ||
                    coupon.getStartDate().isAfter(Instant.now())) {
                throw new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
            }

            // Kiểm tra điều kiện đơn hàng tối thiểu
            if (coupon.getMinOrderAmount() != null && totalAmount < coupon.getMinOrderAmount()) {
                throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá này!");
            }

            // Trừ tiền theo loại Coupon
            if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
                totalAmount -= totalAmount * (coupon.getDiscountValue() / 100.0);
            } else {
                totalAmount -= coupon.getDiscountValue();
            }

            // Đảm bảo tổng tiền không bị âm
            if (totalAmount < 0)
                totalAmount = 0.0;

            // Có thể thêm logic lưu UsageLimit hoặc thông tin UserCoupon ở đây
        }

        // 4. Khởi tạo & Lưu Object Order chính
        Order order = new Order();
        order.setOrderDate(new Date());
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING_PAYMENT); // Trạng thái chờ thanh toán
        order.setShippingAddress(dto.getShippingAddress());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setType(OrderType.ONLINE);
        order = orderRepository.save(order);

        // 5. Khởi tạo OrderItem và Trừ/Cập nhật Kho (SD11)
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();

            // Tạo mục chi tiết đơn hàng
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity((long) item.getQuantity())
                    .price(variant.getPrice())
                    .productName(variant.getProduct().getName())
                    .build();
            orderItemRepository.save(orderItem);

            // Trừ số lượng tồn kho
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
}
