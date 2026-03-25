package org.example.fashionstoresystem.service.return_request;

import org.example.fashionstoresystem.dto.request.ProcessReturnRequestDTO;
import org.example.fashionstoresystem.dto.request.SubmitReturnRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ReturnRequestResponseDTO;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.entity.jpa.OrderItem;
import org.example.fashionstoresystem.entity.jpa.ReturnRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReturnRequestService {
    // Lấy danh sách đơn hàng đang có yêu cầu hoàn trả của khách hàng
    List<ReturnRequestResponseDTO> getReturnRequestsByCustomer(Long customerId);
    Order getOrderForReturn(Long orderId);
    List<OrderItem> validateReturnEligibility(Long orderId, List<Long> itemIds);
    ReturnRequest submitReturnRequest(SubmitReturnRequestDTO dto);

    // Admin
    Page<ReturnRequestResponseDTO> getAllReturnRequests(Pageable pageable);

    ReturnRequestResponseDTO getReturnRequestDetail(Long requestId);

    MessageResponseDTO processReturnRequest(Long requestId, ProcessReturnRequestDTO dto);
}
