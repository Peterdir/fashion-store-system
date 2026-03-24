package org.example.fashionstoresystem.service.return_request;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.SubmitReturnRequestDTO;
import org.example.fashionstoresystem.dto.request.ProcessReturnRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ReturnRequestResponseDTO;
import org.example.fashionstoresystem.entity.enums.OrderStatus;
import org.example.fashionstoresystem.entity.enums.RefundStatus;
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

        // Kiểm tra từng OrderItem có trạng thái DELIVERED không (thay vì check Order.status)
        List<OrderItem> selectedItems = order.getOrderItems().stream()
                .filter(item -> itemIds.contains(item.getId()))
                .toList();

        for (OrderItem item : selectedItems) {
            if (item.getStatus() != OrderStatus.DELIVERED) {
                throw new RuntimeException("Sản phẩm '" + item.getProductName()
                        + "' chưa được giao thành công, không thể hoàn trả!");
            }
        }

        if (returnRepository.existsByOrderItemIdIn(itemIds)) {
            throw new RuntimeException("Một hoặc nhiều sản phẩm đã được yêu cầu hoàn trả trước đó!");
        }

        return selectedItems;
    }

    @Override
    @Transactional
    public ReturnRequest submitReturnRequest(SubmitReturnRequestDTO dto, List<String> images) {
        validateReturnEligibility(dto.getOrderId(), dto.getItemIds());

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setStatus(ReturnStatus.PENDING);
        returnRequest.setReason(dto.getReason());
        returnRequest.setDescription(dto.getDescription());
        returnRequest.setRequestDate(new Date());

        return returnRepository.save(returnRequest);
    }

    // ADMIN API
    @Override
    public List<ReturnRequestResponseDTO> getAllReturnRequests() {
        return returnRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    @Override
    public ReturnRequestResponseDTO getReturnRequestDetail(Long requestId) {
        ReturnRequest rr = returnRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu hoàn trả không tồn tại!"));
        return mapToDTO(rr);
    }

    @Override
    @Transactional
    public MessageResponseDTO processReturnRequest(Long requestId, ProcessReturnRequestDTO dto) {
        ReturnRequest rr = returnRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu hoàn trả không tồn tại!"));

        if (rr.getStatus() != ReturnStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể xử lý yêu cầu đang ở trạng thái Chờ duyệt!");
        }

        rr.setStatus(dto.getNewStatus());
        rr.setProcessedAt(new Date());
        
        if (dto.getNewStatus() == ReturnStatus.REJECTED) {
            rr.setRejectionReason(dto.getRejectionReason());
        } else if (dto.getNewStatus() == ReturnStatus.APPROVED) {
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.PENDING);
            }
        }

        returnRepository.save(rr);

        return MessageResponseDTO.builder()
                .message("Xử lý yêu cầu hoàn trả thành công!")
                .build();
    }

    private ReturnRequestResponseDTO mapToDTO(ReturnRequest rr) {
        return ReturnRequestResponseDTO.builder()
                .requestId(rr.getId())
                .orderId(rr.getOrder().getId())
                .customerName(rr.getUser().getFullName())
                .customerEmail(rr.getUser().getEmail())
                .status(rr.getStatus())
                .reason(rr.getReason())
                .description(rr.getDescription())
                .imageUrls(java.util.Collections.emptyList())
                .requestDate(rr.getRequestDate())
                .rejectionReason(rr.getRejectionReason())
                .build();
    }
}
