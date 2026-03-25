package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.ProcessReturnRequestDTO;
import org.example.fashionstoresystem.dto.response.MessageResponseDTO;
import org.example.fashionstoresystem.dto.response.ReturnRequestResponseDTO;
import org.example.fashionstoresystem.service.return_request.ReturnRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/admin/return-requests")
@RequiredArgsConstructor
public class AdminReturnRequestController {

    private final ReturnRequestService returnRequestService;

    // LẤY TẤT CẢ YÊU CẦU
    @GetMapping
    public ResponseEntity<Page<ReturnRequestResponseDTO>> getAllReturnRequests(Pageable pageable) {
        return ResponseEntity.ok(returnRequestService.getAllReturnRequests(pageable));
    }

    // XEM CHI TIẾT
    @GetMapping("/{requestId}")
    public ResponseEntity<ReturnRequestResponseDTO> getReturnRequestDetail(
            @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(returnRequestService.getReturnRequestDetail(requestId));
    }

    // XỬ LÝ YÊU CẦU
    @PostMapping("/{requestId}/process")
    public ResponseEntity<MessageResponseDTO> processReturnRequest(
            @PathVariable Long requestId,
            @RequestBody ProcessReturnRequestDTO dto
    ) {
        return ResponseEntity.ok(
                returnRequestService.processReturnRequest(requestId, dto)
        );
    }
}
