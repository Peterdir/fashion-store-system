# Danh sách Giao diện cần hoàn thiện (UI Checklist)

Dưới đây là danh sách các giao diện còn thiếu để hoàn thiện hệ thống Fashion Store (H&Y) dựa trên cấu trúc backend hiện tại và các tính năng e-commerce tiêu chuẩn.

## 1. Giao diện dành cho Khách hàng (Customer UI)

### Mua sắm & Thanh toán
- [ ] **Giỏ hàng (Shopping Cart):** Hiển thị danh sách sản phẩm đã chọn, thay đổi số lượng, xóa sản phẩm, tính tổng tiền.
- [ ] **Thanh toán (Checkout):** Nhập thông tin giao hàng, chọn phương thức thanh toán (COD/Online), áp dụng mã giảm giá (Coupon).
- [ ] **Xác nhận đơn hàng (Order Confirmation):** Trang thông báo đặt hàng thành công và tóm tắt đơn hàng.
- [ ] **Tìm kiếm nâng cao (Advanced Search):** Bộ lọc sản phẩm theo giá, màu sắc, kích cỡ, chất liệu.

### Tài khoản người dùng
- [ ] **Hồ sơ cá nhân (User Profile):** Quản lý thông tin cá nhân, địa chỉ nhận hàng.
- [ ] **Lịch sử đơn hàng (Order History):** Xem danh sách các đơn hàng đã đặt, trạng thái đơn hàng (Đang xử lý, Đang giao, Đã hoàn thành).
- [ ] **Chi tiết đơn hàng (Order Details):** Xem chi tiết từng sản phẩm trong đơn hàng cũ, thông tin thanh toán và vận chuyển.
- [ ] **Danh sách yêu thích (Wishlist):** Lưu trữ các sản phẩm khách hàng quan tâm nhưng chưa mua.
- [ ] **Đánh giá sản phẩm (Product Review UI):** Form để khách hàng để lại bình luận và đánh giá sao sau khi mua hàng.

### Xác thực & Bảo mật
- [ ] **Quên mật khẩu (Forgot/Reset Password):** Quy trình khôi phục mật khẩu qua Email/OTP.
- [ ] **Xác thực OTP (OTP Verification):** Giao diện nhập mã OTP để kích hoạt tài khoản hoặc xác nhận giao dịch quan trọng.

---

## 2. Giao diện Quản trị (Admin/Staff Dashboard)

### Tổng quan & Báo cáo
- [ ] **Bảng điều khiển (Dashboard):** Biểu đồ doanh thu, thống kê đơn hàng mới, sản phẩm bán chạy.
- [ ] **Báo cáo chi tiết (Reports):** Xuất báo cáo doanh thu, tồn kho theo thời gian (`ReportService`).

### Quản lý dữ liệu (CRUD)
- [ ] **Quản lý sản phẩm (Product Management):** Thêm/Sửa/Xóa sản phẩm, quản lý biến thể (Size, Color), quản lý kho hàng.
- [ ] **Quản lý danh mục (Category Management):** Quản lý cây danh mục sản phẩm.
- [ ] **Quản lý đơn hàng (Order Management):** Cập nhật trạng thái đơn hàng, in hóa đơn, xử lý hủy đơn.
- [ ] **Quản lý người dùng (User Management):** Quản lý danh sách khách hàng và nhân viên.
- [ ] **Quản lý Coupon (Coupon Management):** Tạo mã giảm giá, thiết lập điều kiện và thời hạn áp dụng.

### Nghiệp vụ khác
- [ ] **Xử lý yêu cầu trả hàng (Return Request Management):** Tiếp nhận và xử lý các yêu cầu đổi trả từ khách hàng (`ReturnRequestService`).
- [ ] **Bán hàng tại quầy (Offline Sale/POS Interface):** Giao diện hỗ trợ nhân viên bán hàng trực tiếp tại cửa hàng (`OfflineSaleService`).

---

## 3. Các thành phần chung (Common Components/UX)
- [ ] **Trang lỗi tùy chỉnh (Custom Error Pages):** 403 (Access Denied), 404 (Not Found), 500 (Server Error).
- [ ] **Thông báo hệ thống (Toast Notifications):** Thông báo khi thêm vào giỏ hàng thành công, đăng nhập sai, v.v.
- [ ] **Modal xác nhận:** Khi xóa mục trong giỏ hàng hoặc hủy đơn hàng.

---
> [!NOTE]
> Các giao diện trên nên được xây dựng đồng nhất với thiết kế của H&Y (Thymeleaf + Tailwind CSS) để đảm bảo trải nghiệm người dùng cao cấp.
