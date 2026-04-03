# HỆ THỐNG QUẢN LÝ CỬA HÀNG THỜI TRANG

## Fashion Store System
## Spring Boot MVC + JPA + Thymeleaf + MySQL + JWT + MoMo Payment

---

## 1. Giới thiệu đề tài

Đây là dự án xây dựng hệ thống quản lý cửa hàng thời trang chạy trên nền tảng web, được phát triển bằng Spring Boot, sử dụng mô hình MVC, JPA/Hibernate để kết nối cơ sở dữ liệu MySQL. Hệ thống cung cấp giao diện người dùng thân thiện với Thymeleaf và bảo mật với JWT authentication.

**Hệ thống hỗ trợ các chức năng chính:**

- Đăng nhập / Đăng ký / Quên mật khẩu
- Quản lý sản phẩm (CRUD)
- Quản lý danh mục
- Quản lý giỏ hàng
- Đặt hàng online
- Thanh toán MoMo (Sandbox)
- Quản lý mã giảm giá (Coupon)
- Đánh giá sản phẩm
- Quản lý yêu thích (Wishlist)
- Quản lý đơn hàng
- Xử lý trả hàng
- Dashboard thống kê
- Bán hàng offline (POS)
- Xuất báo cáo
- Phân quyền ADMIN / CUSTOMER

---

## 2. Công nghệ sử dụng

- **Java** 21
- **Spring Boot** 3.5.10
- **Spring Data JPA** (Hibernate ORM)
- **Spring Security** + **JWT**
- **Thymeleaf** (Template Engine)
- **MySQL** 8+
- **Maven**
- **Lombok**
- **SpringDoc OpenAPI** (Swagger)
- **Spring Mail** (Gmail SMTP)
- **MoMo Payment API** (Sandbox)

---

## 3. Kiến trúc hệ thống

Dự án được tổ chức theo kiến trúc **MVC (Model-View-Controller)** kết hợp **Layered Architecture**:

- **Model/Entity**: ánh xạ đối tượng quan hệ với bảng trong cơ sở dữ liệu
- **Repository**: thao tác dữ liệu qua JPA
- **Service**: xử lý nghiệp vụ
- **Controller**: tiếp nhận yêu cầu từ người dùng
- **View**: giao diện Thymeleaf (HTML/CSS/JS)

**Luồng chính:**

`View (Thymeleaf) -> Controller -> Service -> Repository -> Database`

---

## 4. Cấu trúc dự án

```
fashion-store-system/
├── pom.xml                          # Maven configuration
├── README.md                         # Project documentation
├── Swagger.md                        # API Documentation guide
├── cart_stitch.html                  # Cart utility
├── src/main/
│   ├── java/org/example/fashionstoresystem/
│   │   ├── FashionStoreSystemApplication.java    # Main entry point
│   │   ├── config/                    # Configuration classes
│   │   │   ├── SecurityConfig.java             # Spring Security setup
│   │   │   ├── JwtAuthenticationFilter.java    # JWT filter
│   │   │   ├── JwtAuthenticationEntryPoint.java # Auth entry point
│   │   │   ├── CustomAccessDeniedHandler.java  # Access denied handler
│   │   │   └── MomoConfig.java                 # MoMo payment config
│   │   ├── controller/                # Controllers
│   │   │   ├── api/                   # REST API controllers
│   │   │   ├── view/                  # View controllers (Thymeleaf)
│   │   │   └── advice/                # Global advice
│   │   ├── dto/                       # Data Transfer Objects
│   │   │   ├── request/              # Request DTOs
│   │   │   └── response/             # Response DTOs
│   │   ├── entity/                    # JPA Entities
│   │   │   ├── jpa/                  # Entity classes
│   │   │   └── enums/                # Enum types
│   │   ├── exception/                 # Exception handling
│   │   ├── repository/                # JPA Repositories
│   │   └── service/                   # Business Logic
│   │       ├── auth/
│   │       ├── cart_item/
│   │       ├── category/
│   │       ├── coupon/
│   │       ├── dashboard/
│   │       ├── email_log/
│   │       ├── jwt/
│   │       ├── notification/
│   │       ├── offline_sale/
│   │       ├── order/
│   │       ├── otp/
│   │       ├── payment/
│   │       ├── product/
│   │       ├── recently_viewed/
│   │       ├── report/
│   │       ├── return_request/
│   │       ├── review/
│   │       ├── user/
│   │       └── wishlist_item/
│   └── resources/
│       ├── application.properties     # Application config
│       ├── static/                    # Static resources
│       │   ├── css/
│       │   ├── js/
│       │   └── images/
│       └── templates/                 # Thymeleaf templates
│           ├── admin/
│           │   ├── layout/
│           │   ├── components/
│           │   └── pages/
│           ├── layouts/
│           ├── components/
│           └── pages/
└── target/                            # Compiled output
```

---

## 5. Chức năng chính

### 5.1. Xác thực & Phân quyền

- Đăng ký tài khoản mới
- Đăng nhập bằng email/password
- JWT Access Token & Refresh Token
- Quên mật khẩu qua email (OTP)
- Đăng xuất
- Phân quyền: **ADMIN** và **CUSTOMER**

### 5.2. Quản lý sản phẩm (Admin)

- Thêm sản phẩm mới
- Sửa thông tin sản phẩm
- Xóa sản phẩm
- Tìm kiếm sản phẩm
- Quản lý biến thể (Size, Color, Stock)
- Quản lý hình ảnh sản phẩm
- Cập nhật trạng thái sản phẩm

### 5.3. Quản lý danh mục (Admin)

- Thêm danh mục
- Sửa danh mục
- Xóa danh mục
- Tìm kiếm danh mục
- Gán danh mục cha/con

### 5.4. Quản lý giỏ hàng (Customer)

- Thêm sản phẩm vào giỏ hàng
- Cập nhật số lượng
- Xóa sản phẩm khỏi giỏ
- Kiểm tra tồn kho tự động
- Tính tổng tiền tự động

### 5.5. Quản lý yêu thích (Customer)

- Thêm/xóa sản phẩm yêu thích
- Toggle trạng thái yêu thích
- Xem danh sách yêu thích

### 5.6. Quản lý đơn hàng

- **Customer**: Đặt hàng, xem chi tiết, hủy đơn
- **Admin**: Xác nhận, cập nhật trạng thái, xử lý vận chuyển
- Trạng thái: PENDING_CONFIRMATION, CONFIRMED, SHIPPING, DELIVERED, CANCELLED
- Lịch sử thay đổi trạng thái

### 5.7. Thanh toán

- **COD** (Cash on Delivery)
- **MoMo** (Sandbox) - Tích hợp đầy đủ IPN callback
- Tự động hủy đơn nếu thanh toán MoMo quá hạn 10 phút

### 5.8. Quản lý mã giảm giá

- Tạo mã giảm giá (Admin)
- Các loại: PERCENTAGE, FIXED_AMOUNT
- Điều kiện: MinOrderAmount, MaxDiscount
- Thu thập mã (Customer)
- Áp dụng mã khi đặt hàng

### 5.9. Đánh giá sản phẩm

- Gửi đánh giá với số sao (1-5)
- Upload hình ảnh đánh giá
- Xem đánh giá sản phẩm

### 5.10. Quản lý trả hàng

- Yêu cầu trả hàng (Customer)
- Xử lý yêu cầu (Admin)
- Cập nhật trạng thái: PENDING, APPROVED, REJECTED, COMPLETED
- Hoàn tiền tự động

### 5.11. Dashboard & Thống kê (Admin)

- Tổng số sản phẩm
- Tổng số đơn hàng
- Tổng doanh thu
- Đơn hàng theo trạng thái
- Top sản phẩm bán chạy
- Doanh thu theo ngày/tháng

### 5.12. Bán hàng Offline (POS - Admin)

- Tìm sản phẩm
- Thêm vào hóa đơn
- Thanh toán COD
- In hóa đơn
- Cập nhật tồn kho tự động

### 5.13. Báo cáo (Admin)

- Báo cáo doanh thu
- Báo cáo đơn hàng
- Lọc theo ngày/tháng

---

## 6. Cấu trúc bảng cơ sở dữ liệu

Hệ thống sử dụng **19 bảng** chính trong MySQL:

| Bảng | Mô tả |
|------|-------|
| `users` | Người dùng (Admin/Customer) |
| `categories` | Danh mục sản phẩm |
| `products` | Sản phẩm |
| `product_variants` | Biến thể (Size/Màu/Stock) |
| `product_images` | Hình ảnh sản phẩm |
| `orders` | Đơn hàng |
| `order_items` | Chi tiết đơn hàng |
| `order_histories` | Lịch sử trạng thái đơn hàng |
| `cart_items` | Giỏ hàng |
| `wishlist_items` | Sản phẩm yêu thích |
| `reviews` | Đánh giá sản phẩm |
| `review_images` | Hình ảnh đánh giá |
| `coupons` | Mã giảm giá |
| `user_coupons` | Mã giảm giá của người dùng |
| `return_requests` | Yêu cầu trả hàng |
| `notifications` | Thông báo |
| `recently_viewed_items` | Sản phẩm đã xem gần đây |
| `otps` | Mã OTP đặt lại mật khẩu |
| `password_reset_tokens` | Token đặt lại mật khẩu |
| `refresh_tokens` | Refresh Token |
| `tokens` | Access Token |
| `email_logs` | Nhật ký gửi email |

---

## 7. Hướng dẫn thiết lập cơ sở dữ liệu

### Bước 1: Tạo Database

Truy cập MySQL và tạo database:

```sql
CREATE DATABASE fashion_store_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Bước 2: Cấu hình kết nối

Mở file: `src/main/resources/application.properties`

Chỉnh sửa các thông số:

```properties
# DATABASE CONNECTION (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/fashion_store_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / HIBERNATE CONFIGURATION
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### Bước 3: Thiết lập Environment Variables

Tạo file `.env` hoặc thiết lập biến môi trường:

```bash
DB_USERNAME=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET_KEY_MUST_BE_LONG_ENOUGH
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 8. Hướng dẫn chạy project

### Cách 1: Chạy bằng IntelliJ IDEA

1. Mở project trong IntelliJ IDEA
2. Đợi Maven tải dependencies
3. Chạy file `FashionStoreSystemApplication.java`

### Cách 2: Chạy bằng Maven

Mở terminal tại thư mục project và chạy:

```bash
mvn clean install
mvn spring-boot:run
```

### Cách 3: Chạy file JAR đã build

```bash
mvn clean package
java -jar target/fashion-store-system-0.0.1-SNAPSHOT.jar
```

---

## 9. Tài khoản mẫu

### ADMIN

- **Email:** admin@fashion.com
- **Password:** 12345678

### CUSTOMER

- **Email:** customer1@gmail.com
- **Password:** 12345678

> **Lưu ý:** Tài khoản mẫu được tạo sẵn khi chạy ứng dụng lần đầu (nếu có data.sql).

---

## 10. Phân quyền

### ADMIN

- Quản lý sản phẩm (CRUD)
- Quản lý danh mục (CRUD)
- Quản lý đơn hàng (xác nhận, cập nhật trạng thái)
- Quản lý khách hàng (xem, khóa tài khoản)
- Quản lý mã giảm giá
- Xử lý trả hàng
- Bán hàng offline (POS)
- Xem Dashboard & Báo cáo

### CUSTOMER

- Xem sản phẩm, danh mục
- Tìm kiếm sản phẩm
- Quản lý giỏ hàng
- Quản lý yêu thích
- Đặt hàng
- Thanh toán MoMo/COD
- Xem lịch sử đơn hàng
- Đánh giá sản phẩm
- Yêu cầu trả hàng
- Thu thập & sử dụng mã giảm giá

---

## 11. API Endpoints

### Authentication

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |
| POST | `/api/auth/refresh-token` | Refresh Token |

### Products

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/products/search` | Tìm kiếm sản phẩm |
| POST | `/api/admin/products` | Thêm sản phẩm (Admin) |
| PUT | `/api/admin/products/{id}` | Sửa sản phẩm (Admin) |
| DELETE | `/api/admin/products/{id}` | Xóa sản phẩm (Admin) |

### Orders

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/orders` | Đặt hàng |
| GET | `/api/orders/{id}` | Chi tiết đơn hàng |
| GET | `/api/orders/my` | Đơn hàng của tôi |
| POST | `/api/orders/{id}/cancel` | Hủy đơn hàng |
| PUT | `/api/admin/orders/{id}/status` | Cập nhật trạng thái (Admin) |

### Payment

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/payment/momo/create` | Tạo thanh toán MoMo |
| GET | `/api/payment/momo/return` | MoMo return URL |
| POST | `/api/payment/momo/ipn` | MoMo IPN callback |

### Coupons

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/coupons/available` | Mã giảm giá khả dụng |
| POST | `/api/coupons/collect` | Thu thập mã |
| POST | `/api/coupons/apply` | Áp dụng mã |
| POST | `/api/admin/coupons` | Tạo mã (Admin) |
| PUT | `/api/admin/coupons/{id}` | Sửa mã (Admin) |
| DELETE | `/api/admin/coupons/{id}` | Xóa mã (Admin) |

### Cart

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cart` | Xem giỏ hàng |
| POST | `/api/cart/add` | Thêm vào giỏ |
| PUT | `/api/cart/update` | Cập nhật số lượng |
| DELETE | `/api/cart/{itemId}` | Xóa khỏi giỏ |

### Reviews

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products/{id}/reviews` | Đánh giá sản phẩm |
| POST | `/api/reviews` | Gửi đánh giá |

### Return Requests

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/returns` | Yêu cầu trả hàng |
| GET | `/api/returns/my` | Yêu cầu của tôi |
| GET | `/api/admin/returns` | Tất cả yêu cầu (Admin) |
| PUT | `/api/admin/returns/{id}/process` | Xử lý yêu cầu (Admin) |

### Dashboard (Admin)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/dashboard` | Thống kê tổng quan |
| GET | `/api/admin/reports/revenue` | Báo cáo doanh thu |

---

## 12. Các điểm nổi bật của đồ án

- **Áp dụng mô hình MVC** rõ ràng, tách biệt các tầng
- **Spring Security + JWT** bảo mật đầy đủ
- **JPA/Hibernate** thay thế JDBC thuần, giảm boilerplate code
- **Thymeleaf** render HTML phía server, SEO-friendly
- **Tích hợp MoMo Payment** đầy đủ (Sandbox)
- **Quản lý tồn kho** tự động khi đặt hàng/trả hàng
- **Transaction** cho các nghiệp vụ mượn/trả sách
- **Phân quyền** ADMIN / CUSTOMER
- **Dashboard & Báo cáo** doanh thu chi tiết
- **Đánh giá sản phẩm** kèm hình ảnh
- **Mã giảm giá** linh hoạt (Percentage/Fixed)
- **POS Offline** cho bán hàng tại quầy
- **Notification System** thông báo đơn hàng
- **OTP** xác thực email khi đặt lại mật khẩu

---

## 13. Hướng phát triển thêm
- Tích hợp thêm VNPay, ZaloPay
- Gửi email xác nhận đơn hàng tự động
- Quản lý nhân viên (Admin staff)
- Quản lý nhà cung cấp
- Quản lý kho hàng nâng cao
- Nhật ký hoạt động hệ thống (Audit Log)
- Tích hợp Redis để cache
- Dockerize ứng dụng
- Viết Unit Tests (JUnit, Mockito)
- Triển khai lên Cloud (AWS, Azure, Railway)

---

## 14. Kết luận

Dự án minh họa cách xây dựng một hệ thống thương mại điện tử hoàn chỉnh bằng Spring Boot, JPA/Hibernate và MySQL, với kiến trúc rõ ràng, dễ mở rộng và phù hợp cho đồ án môn học Công Nghệ Phần Mềm.

---

## 15. Thông tin liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ qua email trong hệ thống.

---

**© 2026 - Fashion Store System**
