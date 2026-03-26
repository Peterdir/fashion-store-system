# Tài liệu Test Case API - Hệ thống Fashion Store

Tài liệu này cung cấp các kịch bản test cho toàn bộ Endpoint của hệ thống, bao gồm ví dụ `curl`, Body Request và mã lỗi dự kiến.

---

## 🔑 1. Hệ thống Xác thực & Tài khoản (Public)
**Base URL:** `http://localhost:8080/api/auth`

### 1.1 Đăng ký tài khoản (Register)
*   **Method:** `POST /register`
*   **Body:**
    ```json
    {
      "email": "customer@example.com",
      "password": "Password123",
      "fullName": "Nguyen Van A",
      "phoneNumber": "0987654321"
    }
    ```
*   **Expected Res:** `201 Created`. Nhận `RegisterResponseDTO`.

### 1.2 Đăng nhập (Login)
*   **Method:** `POST /login`
*   **Body:**
    ```json
    {
      "email": "customer@example.com",
      "password": "Password123"
    }
    ```
*   **Expected Res:** `200 OK`. Lưu lại `accessToken` và `refreshToken` để dùng cho các bước sau.

### 1.3 Quên mật khẩu & Reset
*   **Forgot Password:** `POST /forgot-password`
    *   Body: `{"email": "customer@example.com"}`
*   **Reset Password:** `POST /reset-password`
    *   Body: `{"token": "...", "newPassword": "NewPassword123"}`
*   **Expected Res:** `200 OK`.

---

## 👕 2. Sản phẩm (Public)
**Base URL:** `http://localhost:8080/api/products`

### 2.1 Xem danh sách sản phẩm (Phân trang)
*   **Method:** `GET /?keyword=Shirt&page=0&size=10`
*   **Expected Res:** `200 OK`. Trả về Page object.

### 2.2 Xem chi tiết sản phẩm
*   **Method:** `GET /{productId}`
*   **Expected Res:** `200 OK`.

---

## 🛒 3. Chức năng Khách hàng (Yêu cầu JWT Token - Role: USER)
**Headers:** `Authorization: Bearer <accessToken>`

### 3.1 Thông tin cá nhân
*   **Xem Profile:** `GET /api/users/me`
*   **Cập nhật Profile:** `PUT /api/users/me`
*   **Đổi mật khẩu:** `PUT /api/users/me/password`

### 3.2 Giỏ hàng (Cart)
*   **Xem giỏ hàng:** `GET /api/cart?userId={id}`
*   **Thêm vào giỏ:** `POST /api/cart?userId={id}`
    *   Body: `{"variantId": 1, "quantity": 2}`
*   **Cập nhật số lượng:** `PUT /api/cart/items?userId={id}`
    *   Body: `{"cartItemId": 1, "quantity": 5}`
*   **Xóa khỏi giỏ:** `DELETE /api/cart/items/{itemId}?userId={id}`

### 3.3 Đặt hàng & Đơn hàng (Order)
*   **Đặt hàng:** `POST /api/orders`
    *   Body:
        ```json
        {
          "cartItemIds": [1, 2],
          "shippingAddress": "123 Street, District 1",
          "paymentMethod": "COD",
          "couponCode": "SUMMER20"
        }
        ```
*   **Danh sách đơn hàng:** `GET /api/orders?userId={id}&status=PENDING`
*   **Chi tiết đơn hàng:** `GET /api/orders/{orderId}?userId={id}`
*   **Hủy đơn hàng:** `POST /api/orders/{orderId}/cancel?userId={id}`
    *   Body: `{"cancellationReason": "Thay đổi ý định"}`

### 3.4 Review & Wishlist
*   **Đánh giá sản phẩm:** `POST /api/reviews?userId={id}`
    *   Body: `{"variantId": 1, "rating": 5, "comment": "Tuyệt vời!"}`
*   **Toggle Wishlist:** `POST /api/wishlists/toggle?userId={id}&productId={pid}`

---

## 🛠️ 4. Quản trị viên (Yêu cầu JWT Token - Role: ADMIN)
**Base URL:** `http://localhost:8080/api/admin`

### 4.1 Quản lý sản phẩm (Admin)
*   **Tạo mới:** `POST /products`
*   **Cập nhật:** `PUT /products/{id}`
*   **Xóa:** `DELETE /products/{id}`

### 4.2 Quản trị Đơn hàng & Coupon
*   **Duyệt/Cập nhật trạng thái đơn:** `PATCH /orders/{orderId}/status?status=SHIPPING`
*   **Tạo Coupon:** `POST /coupons`
*   **Bật/Tắt Coupon:** `PATCH /coupons/{couponId}/toggle-status`

### 4.3 Báo cáo & Thống kê
*   **Doanh thu:** `GET /reports/revenue?startDate=2024-01-01&endDate=2024-03-31`
*   **Xuất Excel:** `GET /reports/revenue/export?startDate=...&endDate=...&format=xlsx`

---

## 🚨 5. Kiểm tra lỗi (Error Handling)
| Kịch bản | URL | Expected Status |
|---|---|---|
| Không gửi token | `/api/users/me` | `401 Unauthorized` |
| Token hết hạn | `/api/cart` | `401 Unauthorized` |
| Sai Role (User vào Admin) | `/api/admin/products` | `403 Forbidden` |
| Id không tồn tại | `/api/products/9999` | `404 Not Found` |
| Dữ liệu sai định dạng | `POST /api/auth/login` | `400 Bad Request` |
