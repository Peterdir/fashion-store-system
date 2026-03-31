# Phân Tích Trạng Thái Admin — H&Y Fashion Store

## Tổng Quan: API Backend vs Giao Diện Frontend

| Module | API Backend | Giao Diện (HTML + JS) | Trạng Thái |
|---|---|---|---|
| 🔐 Đăng nhập Admin | ✅ Dùng chung `/api/auth/cookie/login` | ✅ `admin/pages/login.html` | ✅ **Xong** |
| 📊 Dashboard (Tổng Quan) | ❌ Chưa có API riêng (data cứng) | ✅ `admin/pages/dashboard.html` | **⚠️ Data giả** |
| 📦 Quản Lý Đơn Hàng | ✅ `AdminOrderController` | ✅ `admin/pages/orders.html` | ✅ **Xong** |
| 👕 Quản Lý Sản Phẩm | ✅ `AdminProductController` | ✅ `admin/pages/products.html` | ✅ **Xong** |
| 👥 Quản Lý Khách Hàng | ✅ `AdminUserController` | ✅ `admin/pages/customers.html` | ✅ **Xong** |
| 🎟️ Quản Lý Mã Giảm Giá | ✅ `AdminCouponController` | ❌ Chưa có giao diện | **🔴 Thiếu** |
| 🔄 Yêu Cầu Hoàn Trả | ✅ `AdminReturnRequestController` | ✅ `admin/pages/returns.html` | ✅ **Xong** |
| 📈 Báo Cáo Doanh Thu | ✅ `ReportController` | ❌ Chưa có giao diện | **🔴 Thiếu** |
| 🏪 Bán Hàng Trực Tiếp | ✅ `OfflineSaleController` | ❌ Chưa có giao diện | **🔴 Thiếu** |

---

## Chi Tiết Từng Module Cần Làm

### 1. 📦 Quản Lý Đơn Hàng (Ưu Tiên Cao)

> [!IMPORTANT]
> Đây là module quan trọng nhất cho Admin, cần ưu tiên làm đầu tiên.

**Cần tạo:** `admin/pages/orders.html` + `static/admin/js/orders.js`

**API có sẵn:**
| Endpoint | Chức năng |
|---|---|
| `GET /api/admin/orders?status=&startDate=&endDate=` | Danh sách đơn hàng (có phân trang, lọc) |
| `GET /api/admin/orders/{orderId}` | Chi tiết đơn hàng |
| `PATCH /api/admin/orders/{orderId}/status?status=` | Cập nhật trạng thái đơn |
| `PATCH /api/admin/orders/items/{itemId}/status?status=` | Cập nhật trạng thái từng sản phẩm |

**Trạng thái đơn hàng:** `PENDING_CONFIRMATION` → `PENDING_PAYMENT` → `PAID` → `PROCESSING` → `SHIPPING` → `DELIVERED` → `COMPLETED` | `CANCELLED` | `PAYMENT_FAILED` | `PAYMENT_EXPIRED`

**Giao diện:** ✅ [orders.html](file:///d:/Subject/CongNghePhanMemHDT/FinalProject/fashion-store-system/src/main/resources/templates/admin/pages/orders.html) + [orders.js](file:///d:/Subject/CongNghePhanMemHDT/FinalProject/fashion-store-system/src/main/resources/static/admin/js/orders.js)

**Tính năng đã có:**
- ✅ Danh sách đơn hàng, phân trang.
- ✅ Bộ lọc trạng thái, ngày tháng (Tự động cập nhật tức thì).
- ✅ Xem chi tiết đơn hàng (Modal).
- ✅ Cập nhật trạng thái từng sản phẩm trong đơn.
- ✅ Tự động chuyển hướng Login nếu hết hạn.

---

### 2. 👕 Quản Lý Sản Phẩm (Ưu Tiên Cao)

**Cần tạo:** `admin/pages/products.html` + `static/admin/js/products.js`

**API có sẵn:**
| Endpoint | Chức năng |
|---|---|
| `GET /api/products` | Danh sách sản phẩm (API public, đã có) |
| `POST /api/admin/products` | Thêm sản phẩm mới |
| `PUT /api/admin/products/{productId}` | Cập nhật sản phẩm |
| `DELETE /api/admin/products/{productId}` | Xóa sản phẩm |

**Giao diện:** ✅ [products.html](file:///d:/Subject/CongNghePhanMemHDT/FinalProject/fashion-store-system/src/main/resources/templates/admin/pages/products.html) + [products.js](file:///d:/Subject/CongNghePhanMemHDT/FinalProject/fashion-store-system/src/main/resources/static/admin/js/products.js)

**Tính năng đã có:**
- ✅ Danh sách sản phẩm, phân trang.
- ✅ Tìm kiếm theo tên (Live Search 300ms debounce), lọc trạng thái.
- ✅ Thêm/Sửa sản phẩm với hình ảnh và biến thể (Modal Slide-over).
- ✅ Xóa sản phẩm (Confirm).
- ✅ Validation form chi tiết.

---

### 3. 👥 Quản Lý Khách Hàng (Ưu Tiên Trung Bình)

**Cần tạo:** `admin/pages/customers.html` + `static/admin/js/customers.js`

**API có sẵn:**
| Endpoint | Chức năng |
|---|---|
| `GET /api/admin/customers?keyword=` | Danh sách KH (có tìm kiếm, phân trang) |
| `GET /api/admin/customers/{customerId}` | Chi tiết KH |
| `PATCH /api/admin/customers/{customerId}/status` | Cập nhật trạng thái (Active/Blocked) |

**Trạng thái:** `PENDING` (Chờ kích hoạt) · `ACTIVE` · `BLOCKED`

**Giao diện:** ✅ [customers.html](file:///d:/Subject/CongNghePhanMemHDT/FinalProject/fashion-store-system/src/main/resources/templates/admin/pages/customers.html) + [customers.js](file:///d:/Subject/CongNghePhanMemHDT/FinalProject/fashion-store-system/src/main/resources/static/admin/js/customers.js)

**Tính năng đã có:**
- ✅ Danh sách khách hàng, phân trang.
- ✅ Tìm kiếm Tên/Email/SĐT (Live Search 300ms debounce).
- ✅ Xem chi tiết & Lịch sử mua hàng (Modal).
- ✅ Khóa/Mở khóa tài khoản ngay lập tức.

---

### 4. 🎟️ Quản Lý Mã Giảm Giá (Ưu Tiên Trung Bình)

**Cần tạo:** `admin/pages/coupons.html` + `static/admin/js/coupons.js`

**API có sẵn:**
| Endpoint | Chức năng |
|---|---|
| `GET /api/admin/coupons` | Danh sách mã (phân trang) |
| `GET /api/admin/coupons/{couponId}` | Chi tiết mã |
| `POST /api/admin/coupons` | Tạo mã mới |
| `PUT /api/admin/coupons/{couponId}` | Cập nhật mã |
| `PATCH /api/admin/coupons/{couponId}/toggle-status` | Bật/Tắt mã |

**Dữ liệu coupon:** `code`, `discountValue`, `discountType` (PERCENTAGE/FIXED), `startDate`, `expiryDate`, `minOrderAmount`

**Giao diện cần có:**
- Bảng danh sách mã giảm giá
- Form tạo/sửa mã
- Toggle bật/tắt mã

---

### 5. 🔄 Yêu Cầu Hoàn Trả (Ưu Tiên Trung Bình)

**Cần tạo:** `admin/pages/returns.html` + `static/admin/js/returns.js`

**API có sẵn:**
| Endpoint | Chức năng |
|---|---|
| `GET /api/admin/return-requests` | Danh sách yêu cầu (phân trang) |
| `GET /api/admin/return-requests/{requestId}` | Chi tiết yêu cầu |
| `POST /api/admin/return-requests/{requestId}/process` | Duyệt/Từ chối |

**Trạng thái:** `PENDING` → `APPROVED` hoặc `REJECTED` → `COMPLETED`

**Giao diện cần có:**
- Bảng danh sách yêu cầu (KH, mã đơn, lý do, trạng thái)
- Modal xem chi tiết + hình ảnh minh chứng
- Nút Duyệt / Từ chối (có input lý do từ chối)

---

### 6. 📈 Báo Cáo Doanh Thu (Ưu Tiên Thấp)

**Cần tạo:** `admin/pages/reports.html` + `static/admin/js/reports.js`

**API có sẵn:**
| Endpoint | Chức năng |
|---|---|
| `GET /api/admin/reports/revenue?startDate=&endDate=` | Xem báo cáo |
| `GET /api/admin/reports/revenue/export?startDate=&endDate=&format=` | Xuất file (PDF/Excel) |

**Dữ liệu:** `onlineRevenue`, `offlineRevenue`, `totalOrders`, danh sách chi tiết đơn

**Giao diện cần có:**
- Bộ lọc ngày (date range picker)
- Card: doanh thu Online, Offline, Tổng
- Bảng chi tiết đơn
- Nút xuất PDF/Excel

---

### 7. 🏪 Bán Hàng Trực Tiếp (Ưu Tiên Thấp)

**Cần tạo:** `admin/pages/offline-sale.html` + `static/admin/js/offline-sale.js`

**API có sẵn:**
| Endpoint | Chức năng |
|---|---|
| `POST /api/admin/offline-sales` | Ghi nhận đơn bán tại quầy |

**Giao diện cần có:**
- Form chọn sản phẩm + số lượng
- Tính tổng tiền tự động
- Nút xác nhận bán

---

## 📋 Thứ Tự Đề Xuất Thực Hiện

| # | Module | Lý do ưu tiên |
|---|---|---|
| 1 | **Đơn Hàng** | Core nghiệp vụ, nhiều endpoint nhất |
| 2 | **Sản Phẩm** | CRUD cơ bản, cần thiết cho demo |
| 3 | **Khách Hàng** | Đơn giản, có tìm kiếm + khóa TK |
| 4 | **Mã Giảm Giá** | CRUD đầy đủ, khá giống Sản Phẩm |
| 5 | **Hoàn Trả** | Workflow duyệt/từ chối |
| 6 | **Báo Cáo** | Nâng cao, cần chart |
| 7 | **Bán Trực Tiếp** | Chỉ 1 endpoint, POS đơn giản |

> [!TIP]
> **Dashboard nên được kết nối data thật cuối cùng**, sau khi các trang con đã hoạt động. Lúc đó chỉ cần gọi tổng hợp từ các API đã có.
