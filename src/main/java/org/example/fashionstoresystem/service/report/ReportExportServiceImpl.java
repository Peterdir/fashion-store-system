package org.example.fashionstoresystem.service.report;

import lombok.RequiredArgsConstructor;
import org.example.fashionstoresystem.dto.response.RevenueReportDTO;
import org.example.fashionstoresystem.service.order.RevenueService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class ReportExportServiceImpl implements ReportExportService {

    private final RevenueService revenueService;

    // Xuất báo cáo doanh thu
    @Override
    public byte[] exportRevenueReport(Date startDate, Date endDate, String format) {
        // Tạo báo cáo dựa trên dữ liệu đã thống kê
        RevenueReportDTO report = revenueService.getDetailedRevenueReport(startDate, endDate);

        if (report == null) {
            throw new RuntimeException("Không có dữ liệu để xuất báo cáo!");
        }

        // Chọn định dạng file
        if ("csv".equalsIgnoreCase(format)) {
            return generateCsv(report, startDate, endDate);
        } else {
            // Định dạng không được hỗ trợ
            throw new RuntimeException("Định dạng '" + format + "' chưa được hỗ trợ! Vui lòng chọn: csv");
        }
    }

    private byte[] generateCsv(RevenueReportDTO report, Date startDate, Date endDate) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // BOM for UTF-8 Excel compatibility
            baos.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});

            PrintWriter writer = new PrintWriter(baos, true, StandardCharsets.UTF_8);

            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
            java.text.DecimalFormat df = new java.text.DecimalFormat("#,##0 VNĐ");

            writer.println("BÁO CÁO DOANH THU");
            writer.println("Từ ngày:," + sdf.format(startDate));
            writer.println("Đến ngày:," + sdf.format(endDate));
            writer.println();

            writer.println("TỔNG QUAN");
            writer.println("Doanh thu Online:,\"" + df.format(report.getOnlineRevenue()) + "\"");
            writer.println("Doanh thu Offline:,\"" + df.format(report.getOfflineRevenue()) + "\"");
            writer.println("Tổng doanh thu:,\"" + df.format(report.getOnlineRevenue() + report.getOfflineRevenue()) + "\"");
            writer.println("Tổng số đơn hàng:," + report.getTotalOrders());
            writer.println();

            writer.println("CHI TIẾT ĐƠN HÀNG");
            writer.println("Mã đơn,Ngày đặt,Kênh bán,Tên sản phẩm,Số lượng,Đơn giá,Thành tiền,Mã giảm giá,Tiền giảm giá,Tổng tiền thanh toán");
            
            if (report.getOrders() != null) {
                for (RevenueReportDTO.OrderSummaryDTO order : report.getOrders()) {
                    String orderIdStr = "ORD-" + String.format("%04d", order.getOrderId());
                    // Order date comes as string, we can reformat if it's standard format, or just print it if plain
                    // But orderDate is just `order.getOrderDate().toString()`, let's try to extract cleanly if possible
                    String orderDateStr = order.getOrderDate(); 
                    if (orderDateStr != null && orderDateStr.contains(".")) {
                       orderDateStr = orderDateStr.substring(0, orderDateStr.lastIndexOf('.'));
                    }
                    
                    String orderType = order.getType() != null ? order.getType().toString() : "";
                    String orderTotal = "\"" + df.format(order.getTotalAmount() != null ? order.getTotalAmount() : 0.0) + "\"";
                    String discountAmountStr = "\"" + df.format(order.getDiscountAmount() != null ? order.getDiscountAmount() : 0.0) + "\"";
                    String couponCode = order.getCouponCode() != null ? order.getCouponCode() : "";
                    if (!couponCode.isEmpty()) couponCode = "\"" + couponCode + "\"";

                    if (order.getItems() != null && !order.getItems().isEmpty()) {
                        for (RevenueReportDTO.OrderItemDTO item : order.getItems()) {
                            double price = item.getPrice() != null ? item.getPrice() : 0.0;
                            long quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                            double itemTotal = price * quantity;

                            // escape product name
                            String productName = item.getProductName() != null ? item.getProductName() : "";
                            productName = "\"" + productName.replace("\"", "\"\"") + "\"";

                            writer.println(orderIdStr + ","
                                    + "\"" + orderDateStr + "\","
                                    + orderType + ","
                                    + productName + ","
                                    + quantity + ","
                                    + "\"" + df.format(price) + "\","
                                    + "\"" + df.format(itemTotal) + "\","
                                    + couponCode + ","
                                    + discountAmountStr + ","
                                    + orderTotal);
                        }
                    } else {
                        // Order with no items? Just print order info
                        writer.println(orderIdStr + ","
                                + "\"" + orderDateStr + "\","
                                + orderType + ","
                                + "," // product name empty
                                + "," // qty empty
                                + "," // price empty
                                + "," // item total empty
                                + couponCode + ","
                                + discountAmountStr + ","
                                + orderTotal);
                    }
                }
            }

            writer.flush();
            writer.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo file báo cáo CSV: " + e.getMessage());
        }
    }
}
