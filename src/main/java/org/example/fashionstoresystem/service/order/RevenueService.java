package org.example.fashionstoresystem.service.order;

import org.example.fashionstoresystem.dto.response.RevenueReportDTO;

import java.util.Date;

public interface RevenueService {
    RevenueReportDTO getDetailedRevenueReport(Date startDate, Date endDate);
}
