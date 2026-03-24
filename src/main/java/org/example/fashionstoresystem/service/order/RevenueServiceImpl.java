package org.example.fashionstoresystem.service.order;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.RevenueReportDTO;
import org.example.fashionstoresystem.entity.jpa.Order;
import org.example.fashionstoresystem.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RevenueServiceImpl implements RevenueService {

    private final OrderRepository orderRepository;

    @Override
    public RevenueReportDTO getDetailedRevenueReport(Date startDate, Date endDate) {
        Double onlineRevenue = orderRepository.calculateTotalRevenue(startDate, endDate, org.example.fashionstoresystem.entity.enums.OrderType.ONLINE);
        if (onlineRevenue == null) onlineRevenue = 0.0;

        Double offlineRevenue = orderRepository.calculateTotalRevenue(startDate, endDate, org.example.fashionstoresystem.entity.enums.OrderType.OFFLINE);
        if (offlineRevenue == null) offlineRevenue = 0.0;

        int totalOrders = orderRepository.countOrders(startDate, endDate);
        
        List<Order> orderList = orderRepository.findByOrderDateBetween(startDate, endDate);

        return combineToDetailedRevenueReport(onlineRevenue, offlineRevenue, totalOrders, orderList);
    }

    private RevenueReportDTO combineToDetailedRevenueReport(Double online, Double offline, int totalOrders, List<Order> orderList) {
        return RevenueReportDTO.builder()
                .onlineRevenue(online)
                .offlineRevenue(offline)
                .totalOrders(totalOrders)
                .orders(orderList.stream()
                        .map(order -> RevenueReportDTO.OrderSummaryDTO.builder()
                                .orderId(order.getId())
                                .totalAmount(order.getTotalAmount())
                                .type(order.getType())
                                .orderDate(order.getOrderDate() != null ? order.getOrderDate().toString() : "")
                                .items(order.getOrderItems().stream()
                                        .map(item -> RevenueReportDTO.OrderItemDTO.builder()
                                                .productName(item.getProductName())
                                                .quantity(item.getQuantity())
                                                .price(item.getProductVariant() != null ? item.getProductVariant().getPrice() : 0.0)
                                                .build())
                                        .toList())
                                .build())
                        .toList())
                .build();
    }
}
