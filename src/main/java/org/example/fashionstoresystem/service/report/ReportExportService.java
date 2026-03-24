package org.example.fashionstoresystem.service.report;

import java.util.Date;

public interface ReportExportService {
    // Xuất báo cáo doanh thu
    byte[] exportRevenueReport(Date startDate, Date endDate, String format);
}
