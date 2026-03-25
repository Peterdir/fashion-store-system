package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.SubmitReturnRequestDTO;
import org.example.fashionstoresystem.dto.response.ReturnRequestResponseDTO;
import org.example.fashionstoresystem.entity.jpa.ReturnRequest;
import org.example.fashionstoresystem.service.return_request.ReturnRequestService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/return-requests")
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    // LẤY DS YÊU CẦU TRẢ HÀNG
    @GetMapping
    public ResponseEntity<List<ReturnRequestResponseDTO>> getReturnRequestsByCustomer(
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(
                returnRequestService.getReturnRequestsByCustomer(userId)
        );
    }

    // GỬI YÊU CẦU TRẢ HÀNG (JSON)
    @PostMapping
    public ResponseEntity<ReturnRequest> submitReturnRequest(
            @RequestBody SubmitReturnRequestDTO dto
    ) {
        return ResponseEntity.ok(
                returnRequestService.submitReturnRequest(dto)
        );
    }
}
