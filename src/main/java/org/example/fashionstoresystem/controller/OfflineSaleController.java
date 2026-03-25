package org.example.fashionstoresystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.request.RecordOfflineSaleRequestDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;
import org.example.fashionstoresystem.service.offline_sale.OfflineSaleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/offline-sales")
@RequiredArgsConstructor
public class OfflineSaleController {

    private final OfflineSaleService offlineSaleService;

    // GHI NHẬN BÁN TRỰC TIẾP
    @PostMapping
    public ResponseEntity<PlaceOrderResponseDTO> recordOfflineSale(
            @RequestBody RecordOfflineSaleRequestDTO dto
    ) {

        PlaceOrderResponseDTO response = offlineSaleService.recordOfflineSale(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
