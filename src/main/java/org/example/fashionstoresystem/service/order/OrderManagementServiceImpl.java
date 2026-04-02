package org.example.fashionstoresystem.service.order;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderDetailResponseDTO;
import org.example.fashionstoresystem.dto.response.OrderSummaryResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.jpa.OrderHistory;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.repository.OrderHistoryRepository;
import org.example.fashionstoresystem.repository.OrderItemRepository;
import org.example.fashionstoresystem.entity.enums.RefundStatus;
import org.example.fashionstoresystem.service.notification.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class OrderManagementServiceImpl implements OrderManagementService {

    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository historyRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void updateOrderItemStatus(Long orderItemId, OrderStatus newStatus) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm trong đơn hàng không tồn tại!"));

        OrderStatus currentStatus = item.getStatus();
        checkStatusTransition(currentStatus, newStatus);

        item.setStatus(newStatus);
        orderItemRepository.save(item);

        OrderHistory history = OrderHistory.builder()
                .orderItem(item)
                .previousStatus(currentStatus)
                .newStatus(newStatus)
                .changeDate(new Date())
                .build();
        historyRepository.save(history);

        // Gửi thông báo cho user
        String content = "Sản phẩm '" + item.getProductName() + "' trong đơn hàng #" + item.getOrder().getId() + " đã chuyển sang trạng thái: " + newStatus;
        notificationService.createNotification(
                item.getOrder().getUser(),
                "Cập nhật trạng thái đơn hàng",
                content,
                "INFO",
                item.getOrder().getId()
        );
    }

    private void checkStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.COMPLETED) {
            throw new RuntimeException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus);
        }
    }

    @Override
    public Page<OrderSummaryResponseDTO> getAllOrders(OrderStatus status, Date startDate, Date endDate, Pageable pageable) {
        return orderRepository.searchOrders(status, startDate, endDate, pageable).map(o -> {
            Map<String, Integer> statusSummary = new HashMap<>();
            for (OrderItem item : o.getOrderItems()) {
                String ss = item.getStatus().name();
                statusSummary.put(ss, statusSummary.getOrDefault(ss, 0) + 1);
            }
            return OrderSummaryResponseDTO.builder()
                    .orderId(o.getId())
                    .orderDate(o.getOrderDate())
                    .totalAmount(o.getTotalAmount())
                    .paymentMethod(o.getPaymentMethod())
                    .itemCount(o.getOrderItems().size())
                    .statusSummary(statusSummary)
                    .build();
        });
    }

    @Override
    public OrderDetailResponseDTO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
        
        List<OrderDetailResponseDTO.OrderItemDTO> itemDTOs = order.getOrderItems().stream().map(item -> {
            List<OrderDetailResponseDTO.OrderHistoryDTO> histories = item.getOrderHistories().stream().map(h -> 
                OrderDetailResponseDTO.OrderHistoryDTO.builder()
                        .previousStatus(h.getPreviousStatus())
                        .newStatus(h.getNewStatus())
                        .changeDate(h.getChangeDate())
                        .build()
            ).collect(Collectors.toList());

            return OrderDetailResponseDTO.OrderItemDTO.builder()
                    .orderItemId(item.getId())
                    .productName(item.getProductName())
                    .size(item.getProductVariant().getSize())
                    .color(item.getProductVariant().getColor())
                    .quantity(item.getQuantity())
                    .price(item.getProductVariant().getPrice())
                    .status(item.getStatus())
                    .refundStatus(item.getRefundStatus())
                    .cancellationReason(item.getCancellationReason())
                    .histories(histories)
                    .build();
        }).collect(Collectors.toList());

        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .items(itemDTOs)
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
        
        boolean updated = false;
        for (OrderItem item : order.getOrderItems()) {
            if (item.getStatus() != OrderStatus.CANCELLED && item.getStatus() != OrderStatus.COMPLETED && item.getStatus() != status) {
                updateOrderItemStatus(item.getId(), status);
                updated = true;
            }
        }
        
        if (!updated) {
            throw new RuntimeException("Không có sản phẩm nào trong đơn hàng có thể cập nhật trạng thái mới này!");
        }

        return MessageResponseDTO.builder()
                .message("Cập nhật trạng thái đơn hàng thành công!")
                .build();
    }

    @Override
    @Transactional
    public void updateRefundStatus(Long orderItemId, RefundStatus status) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm trong đơn hàng không tồn tại!"));

        item.setRefundStatus(status);
        orderItemRepository.save(item);

        // Gửi thông báo cho user nếu hoàn tiền thành công
        if (status == RefundStatus.COMPLETED) {
            String content = "Sản phẩm '" + item.getProductName() + "' trong đơn hàng #" + item.getOrder().getId() + " đã được hoàn tiền thành công.";
            notificationService.createNotification(
                    item.getOrder().getUser(),
                    "Thông báo hoàn tiền",
                    content,
                    "SUCCESS",
                    item.getOrder().getId()
            );
        }
    }
}
