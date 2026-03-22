package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.jpa.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    // Lấy danh sách Yêu cầu hoàn trả theo Trạng thái Ví dụ "CHỜ DUYỆT"
    // Ưu tiên xếp người gửi lâu nhất (RequestDate tăng dần) lên đầu trang để xử lý trước!
    Page<ReturnRequest> findByStatusOrderByRequestDateAsc(String status, Pageable pageable);
}
