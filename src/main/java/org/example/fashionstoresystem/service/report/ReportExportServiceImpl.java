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

            writer.println("BÁO CÁO DOANH THU");
            writer.println("Từ ngày," + startDate);
            writer.println("Đến ngày," + endDate);
            writer.println();

            writer.println("TỔNG HỢP");
            writer.println("Doanh thu Online," + report.getOnlineRevenue());
            writer.println("Doanh thu Offline," + report.getOfflineRevenue());
            writer.println("Tổng doanh thu," + (report.getOnlineRevenue() + report.getOfflineRevenue()));
            writer.println("Tổng số đơn hàng," + report.getTotalOrders());
            writer.println();

            writer.println("CHI TIẾT ĐƠN HÀNG");
            if (report.getOrders() != null) {
                for (RevenueReportDTO.OrderSummaryDTO order : report.getOrders()) {
                    writer.println();
                    writer.println("Đơn hàng #" + order.getOrderId()
                            + ",Tổng tiền: " + order.getTotalAmount()
                            + ",Loại: " + order.getType()
                            + ",Ngày: " + order.getOrderDate());
                    writer.println("Tên sản phẩm,Số lượng,Đơn giá");
                    if (order.getItems() != null) {
                        for (RevenueReportDTO.OrderItemDTO item : order.getItems()) {
                            writer.println(item.getProductName() + ","
                                    + item.getQuantity() + ","
                                    + item.getPrice());
                        }
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
