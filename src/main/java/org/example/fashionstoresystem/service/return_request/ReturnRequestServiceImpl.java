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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnRequestServiceImpl implements ReturnRequestService {

    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRepository;

    @Override
    public List<ReturnRequestResponseDTO> getReturnRequestsByCustomer(Long customerId) {
        return returnRepository.findByUserIdOrderByRequestDateDesc(customerId)
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public Order getOrderForReturn(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
    }

    @Override
    public List<OrderItem> validateReturnEligibility(Long orderId, List<Long> itemIds) {
        Order order = getOrderForReturn(orderId);

        List<OrderItem> selectedItems = order.getOrderItems().stream()
                .filter(item -> itemIds.contains(item.getId()))
                .toList();

        for (OrderItem item : selectedItems) {
            if (item.getStatus() != OrderStatus.DELIVERED && item.getStatus() != OrderStatus.COMPLETED) {
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
    public ReturnRequest submitReturnRequest(SubmitReturnRequestDTO dto) {
        List<OrderItem> returnItems = validateReturnEligibility(dto.getOrderId(), dto.getItemIds());
        Order order = returnItems.getFirst().getOrder();

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setUser(order.getUser());
        returnRequest.setReturnItems(new ArrayList<>(returnItems));
        returnRequest.setStatus(ReturnStatus.PENDING);
        returnRequest.setReason(dto.getReason());
        returnRequest.setDescription(dto.getDescription());
        returnRequest.setRequestDate(new Date());
        returnRequest.setImageUrls(dto.getImageUrls());

        // Mark items as PENDING refund and link to request
        for (OrderItem item : returnItems) {
            item.setRefundStatus(RefundStatus.PENDING);
            item.setReturnRequest(returnRequest);
        }

        return returnRepository.save(returnRequest);
    }

    @Override
    public Page<ReturnRequestResponseDTO> getAllReturnRequests(ReturnStatus status, Pageable pageable) {
        if (status != null) {
            return returnRepository.findByStatusOrderByRequestDateAsc(status, pageable).map(this::mapToDTO);
        }
        return returnRepository.findAll(pageable).map(this::mapToDTO);
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

        ReturnStatus currentStatus = rr.getStatus();
        ReturnStatus nextStatus = dto.getNewStatus();

        // Validation for workflow transitions
        if (currentStatus == ReturnStatus.PENDING) {
            if (nextStatus != ReturnStatus.APPROVED && nextStatus != ReturnStatus.REJECTED) {
                throw new RuntimeException("Chỉ có thể Duyệt hoặc Từ chối yêu cầu đang chờ!");
            }
        } else if (currentStatus == ReturnStatus.APPROVED) {
            if (nextStatus != ReturnStatus.COMPLETED) {
                throw new RuntimeException("Chủ có thể Hoàn tất yêu cầu đã được duyệt!");
            }
        } else {
            throw new RuntimeException("Yêu cầu đã kết thúc, không thể xử lý thêm!");
        }

        rr.setStatus(nextStatus);
        rr.setProcessedAt(new Date());

        if (nextStatus == ReturnStatus.REJECTED) {
            rr.setRejectionReason(dto.getRejectionReason());
            // Reset items status back to NONE if rejected
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.NONE);
            }
        } else if (nextStatus == ReturnStatus.APPROVED) {
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.PENDING);
            }
        } else if (nextStatus == ReturnStatus.COMPLETED) {
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.COMPLETED);
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
                .imageUrls(rr.getImageUrls())
                .requestDate(rr.getRequestDate())
                .rejectionReason(rr.getRejectionReason())
                .paymentMethod(rr.getOrder().getPaymentMethod().name())
                .build();
    }
}
