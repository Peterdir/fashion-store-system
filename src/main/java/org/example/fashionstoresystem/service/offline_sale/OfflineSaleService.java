package org.example.fashionstoresystem.service.offline_sale;

import org.example.fashionstoresystem.dto.request.RecordOfflineSaleRequestDTO;
import org.example.fashionstoresystem.dto.response.PlaceOrderResponseDTO;

public interface OfflineSaleService {
    // Ghi nhận bán hàng trực tiếp
    PlaceOrderResponseDTO recordOfflineSale(RecordOfflineSaleRequestDTO dto);
}
