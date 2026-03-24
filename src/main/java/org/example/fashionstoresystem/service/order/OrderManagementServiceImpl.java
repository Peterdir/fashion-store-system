package org.example.fashionstoresystem.service.order;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.jpa.OrderHistory;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.repository.OrderHistoryRepository;
import org.example.fashionstoresystem.repository.OrderItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class OrderManagementServiceImpl implements OrderManagementService {

    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository historyRepository;

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
    }

    private void checkStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.COMPLETED) {
            throw new RuntimeException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus);
        }
    }
}
