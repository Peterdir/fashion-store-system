package org.example.fashionstoresystem.service.return_request;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.SubmitReturnRequestDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.ReturnStatus;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.entity.jpa.ReturnRequest;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.example.fashionstoresystem.repository.ReturnRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnRequestServiceImpl implements ReturnRequestService {

    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRepository;

    @Override
    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(customerId);
    }

    @Override
    public Order getOrderForReturn(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
    }

    @Override
    public List<OrderItem> validateReturnEligibility(Long orderId, List<Long> itemIds) {
        Order order = getOrderForReturn(orderId);
        
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Chỉ có thể hoàn trả đơn hàng đã giao thành công!");
        }

        if (returnRepository.existsByOrderItemIdIn(itemIds)) {
            throw new RuntimeException("Một hoặc nhiều sản phẩm đã được yêu cầu hoàn trả trước đó!");
        }

        return order.getOrderItems().stream()
                .filter(item -> itemIds.contains(item.getId()))
                .toList();
    }

    @Override
    @Transactional
    public ReturnRequest submitReturnRequest(SubmitReturnRequestDTO dto, List<String> images) {
        // Validate
        validateReturnEligibility(dto.getOrderId(), dto.getItemIds());

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setStatus(ReturnStatus.PENDING);
        returnRequest.setReason(dto.getReason());
        returnRequest.setDescription(dto.getDescription());
        returnRequest.setRequestDate(new Date());

        return returnRepository.save(returnRequest);
    }
}
