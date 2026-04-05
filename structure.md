# 📋 H&Y Fashion Store System — Phân Tích Cấu Trúc Dự Án

> **Version**: Spring Boot 3.5.10 | Java 21 | MySQL | Thymeleaf + Vanilla JS  
> **Ngày phân tích**: 05/04/2026

---

## 📁 I. CẤU TRÚC THƯ MỤC TỔNG QUAN

```
fashion-store-system/
├── pom.xml                          # Maven config (Spring Boot 3.5.10, Java 21)
├── README.md                        # Tài liệu dự án
├── Swagger.md                       # Hướng dẫn API docs
│
└── src/
    ├── main/
    │   ├── java/org/example/fashionstoresystem/
    │   │   ├── FashionStoreSystemApplication.java    # Entry point (@EnableScheduling)
    │   │   │
    │   │   ├── config/                  # ⚙️ CẤU HÌNH
    │   │   │   ├── SecurityConfig.java              # Spring Security + JWT stateless
    │   │   │   ├── JwtAuthenticationFilter.java     # JWT filter (OncePerRequestFilter)
    │   │   │   ├── JwtAuthenticationEntryPoint.java # Xử lý 401 Unauthorized
    │   │   │   ├── CustomAccessDeniedHandler.java   # Xử lý 403 Forbidden
    │   │   │   └── MomoConfig.java                  # Config MoMo Payment
    │   │   │
    │   │   ├── controller/              # 🎮 CONTROLLER LAYER
    │   │   │   ├── advice/
    │   │   │   │   └── GlobalControllerAdvice.java  # Inject global model attrs
    │   │   │   │
    │   │   │   ├── api/                             # REST API Controllers (24 files)
    │   │   │   │   ├── AuthController.java          # Đăng ký/Đăng nhập/JWT
    │   │   │   │   ├── CookieAuthController.java    # Quản lý auth cookies (SSR)
    │   │   │   │   ├── OrderController.java         # Đặt hàng/Hủy đơn (Customer)
    │   │   │   │   ├── CartController.java          # Giỏ hàng
    │   │   │   │   ├── ProductController.java       # Sản phẩm (Public)
    │   │   │   │   ├── CategoryController.java      # Danh mục (Public)
    │   │   │   │   ├── CouponController.java        # Mã giảm giá (Customer)
    │   │   │   │   ├── UserController.java          # Thông tin cá nhân
    │   │   │   │   ├── WishlistController.java      # Yêu thích
    │   │   │   │   ├── ReviewController.java        # Đánh giá
    │   │   │   │   ├── NotificationController.java  # Thông báo
    │   │   │   │   ├── PaymentController.java       # Thanh toán MoMo
    │   │   │   │   ├── OtpController.java           # Xác thực 2FA
    │   │   │   │   ├── ReturnRequestController.java # Yêu cầu trả hàng
    │   │   │   │   ├── RecentlyViewedAPIController.java # Sản phẩm xem gần đây
    │   │   │   │   ├── ReportController.java        # Báo cáo doanh thu (Admin)
    │   │   │   │   ├── DashboardController.java     # Dashboard (Admin)
    │   │   │   │   ├── OfflineSaleController.java   # Bán hàng tại quầy (Admin)
    │   │   │   │   ├── AdminOrderController.java    # Quản lý đơn hàng (Admin)
    │   │   │   │   ├── AdminProductController.java  # Quản lý sản phẩm (Admin)
    │   │   │   │   ├── AdminCategoryController.java # Quản lý danh mục (Admin)
    │   │   │   │   ├── AdminCouponController.java   # Quản lý mã giảm giá (Admin)
    │   │   │   │   ├── AdminUserController.java     # Quản lý khách hàng (Admin)
    │   │   │   │   └── AdminReturnRequestController.java # Xử lý trả hàng (Admin)
    │   │   │   │
    │   │   │   └── view/                            # Thymeleaf View Controllers (8 files)
    │   │   │       ├── HomeViewController.java      # Trang chủ "/"
    │   │   │       ├── AuthViewController.java      # Login/Register pages
    │   │   │       ├── CartViewController.java      # Trang giỏ hàng
    │   │   │       ├── CheckoutPageController.java  # Trang thanh toán
    │   │   │       ├── ProductViewController.java   # Trang sản phẩm/danh mục
    │   │   │       ├── UserViewController.java      # Trang cá nhân
    │   │   │       ├── PolicyViewController.java    # Trang chính sách
    │   │   │       └── admin/
    │   │   │           └── AdminController.java     # Trang quản trị
    │   │   │
    │   │   ├── dto/                     # 📦 DATA TRANSFER OBJECTS
    │   │   │   ├── request/  (29 files)             # Request DTOs (có @Valid)
    │   │   │   └── response/ (30 files)             # Response DTOs (Builder pattern)
    │   │   │
    │   │   ├── entity/                  # 🗄️ ENTITY LAYER
    │   │   │   ├── jpa/      (22 files)             # JPA Entities (Lombok + Builder)
    │   │   │   │   ├── User.java                    # implements UserDetails
    │   │   │   │   ├── Product.java                 # + Variants, Images, Reviews
    │   │   │   │   ├── ProductVariant.java          # Size, Color, Stock, Price
    │   │   │   │   ├── ProductImage.java            # URL + Color mapping
    │   │   │   │   ├── Category.java                # Self-referencing (parent-child)
    │   │   │   │   ├── Order.java                   # + OrderItems, ReturnRequests
    │   │   │   │   ├── OrderItem.java               # Status riêng từng item
    │   │   │   │   ├── OrderHistory.java            # Lịch sử chuyển trạng thái
    │   │   │   │   ├── CartItem.java
    │   │   │   │   ├── WishlistItem.java
    │   │   │   │   ├── Coupon.java
    │   │   │   │   ├── UserCoupon.java
    │   │   │   │   ├── ReturnRequest.java
    │   │   │   │   ├── Review.java
    │   │   │   │   ├── ReviewImage.java
    │   │   │   │   ├── Notification.java
    │   │   │   │   ├── Token.java                   # JWT Access Token
    │   │   │   │   ├── RefreshToken.java
    │   │   │   │   ├── PasswordResetToken.java
    │   │   │   │   ├── Otp.java                     # 2FA OTP
    │   │   │   │   ├── EmailLog.java
    │   │   │   │   └── RecentlyViewedItem.java
    │   │   │   │
    │   │   │   └── enums/    (10 files)             # Business Enums
    │   │   │       ├── Role.java                    # CUSTOMER, ADMIN
    │   │   │       ├── UserStatus.java              # PENDING, ACTIVE, BLOCKED, DELETED
    │   │   │       ├── OrderStatus.java             # 10 trạng thái đơn hàng
    │   │   │       ├── OrderType.java               # ONLINE, OFFLINE
    │   │   │       ├── PaymentMethod.java           # COD, MOMO
    │   │   │       ├── ProductStatus.java           # ACTIVE, INACTIVE, OUT_OF_STOCK
    │   │   │       ├── DiscountType.java            # PERCENTAGE, FIXED
    │   │   │       ├── RefundStatus.java            # PENDING, COMPLETED, FAILED
    │   │   │       ├── ReturnStatus.java            # PENDING, APPROVED, REJECTED, COMPLETED
    │   │   │       └── TokenType.java               # BEARER
    │   │   │
    │   │   ├── repository/             # 🗃️ REPOSITORY LAYER (23 files)
    │   │   │   ├── UserRepository.java
    │   │   │   ├── ProductRepository.java           # Custom JPQL queries
    │   │   │   ├── ProductCleanupRepository.java    # Nuclear delete logic
    │   │   │   ├── OrderRepository.java             # Complex search queries
    │   │   │   ├── OrderItemRepository.java         # Multi-filter queries
    │   │   │   ├── ReviewRepository.java
    │   │   │   ├── CouponRepository.java
    │   │   │   └── ... (16 more repos)
    │   │   │
    │   │   ├── service/                # 🧠 SERVICE LAYER (19 packages)
    │   │   │   ├── auth/
    │   │   │   │   ├── AuthService.java             # Interface
    │   │   │   │   ├── AuthServiceImpl.java         # (376 lines) Register/Login/JWT/Reset
    │   │   │   │   └── CustomUserDetailsService.java
    │   │   │   │
    │   │   │   ├── order/
    │   │   │   │   ├── OrderService.java            # Interface (Customer ops)
    │   │   │   │   ├── OrderServiceImpl.java        # ⚠️ (566 lines) God-class tendency
    │   │   │   │   ├── OrderManagementService.java  # Interface (Admin ops)
    │   │   │   │   ├── OrderManagementServiceImpl.java # (249 lines)
    │   │   │   │   ├── OrderExpirationTask.java     # @Scheduled job
    │   │   │   │   ├── RevenueService.java          # Interface
    │   │   │   │   └── RevenueServiceImpl.java
    │   │   │   │
    │   │   │   ├── product/
    │   │   │   │   ├── ProductService.java          # Interface
    │   │   │   │   └── ProductServiceImpl.java      # (373 lines) CRUD + Search + Category
    │   │   │   │
    │   │   │   ├── user/
    │   │   │   │   ├── UserService.java             # Interface
    │   │   │   │   └── UserServiceImpl.java         # Profile + Admin customer mgmt
    │   │   │   │
    │   │   │   ├── payment/
    │   │   │   │   ├── PaymentService.java          # Interface
    │   │   │   │   ├── PaymentServiceImpl.java      # Xử lý callback MoMo
    │   │   │   │   └── MomoService.java             # ⚠️ Concrete class, no interface
    │   │   │   │
    │   │   │   ├── cart_item/
    │   │   │   │   ├── CartService.java
    │   │   │   │   └── CartServiceImpl.java
    │   │   │   │
    │   │   │   ├── jwt/
    │   │   │   │   └── JwtService.java              # ⚠️ Concrete class, no interface
    │   │   │   │
    │   │   │   ├── category/      ── CategoryService + Impl
    │   │   │   ├── coupon/        ── CouponService + Impl
    │   │   │   ├── review/        ── ReviewService + Impl
    │   │   │   ├── notification/  ── NotificationService + Impl
    │   │   │   ├── email_log/     ── EmailService + Impl
    │   │   │   ├── otp/           ── OtpService + Impl
    │   │   │   ├── wishlist_item/ ── WishlistService + Impl
    │   │   │   ├── dashboard/     ── DashboardService + Impl
    │   │   │   ├── return_request/── ReturnRequestService + Impl
    │   │   │   ├── offline_sale/  ── OfflineSaleService + Impl
    │   │   │   ├── recently_viewed/ ── RecentlyViewedService + Impl
    │   │   │   └── report/        ── ReportExportService + Impl
    │   │   │
    │   │   ├── exception/              # ❌ EXCEPTION HANDLING
    │   │   │   ├── GlobalExceptionHandler.java      # @RestControllerAdvice
    │   │   │   └── UnauthenticatedException.java    # Custom 401 exception
    │   │   │
    │   │   ├── util/                   # 🔧 UTILITIES
    │   │   │   └── SecurityUtils.java               # Get authenticated userId
    │   │   │
    │   │   ├── utils/                  # 🔧 ⚠️ DUPLICATE PACKAGE!
    │   │   │   └── MediaTypeUtils.java
    │   │   │
    │   │   ├── validation/             # ✅ CUSTOM VALIDATION
    │   │   │   ├── PasswordMatch.java               # Custom annotation
    │   │   │   └── PasswordMatchValidator.java
    │   │   │
    │   │   └── uml/                    # 📊 UML DIAGRAMS (PlantUML)
    │   │       ├── Activity/
    │   │       ├── Class/
    │   │       ├── Object/
    │   │       ├── Sequence/
    │   │       └── UseCase/
    │   │
    │   └── resources/
    │       ├── application.properties   # DB, Mail, JWT, MoMo config
    │       │
    │       ├── templates/               # 🖼️ THYMELEAF TEMPLATES
    │       │   ├── layouts/
    │       │   │   └── layout.html      # Main layout (Thymeleaf Layout Dialect)
    │       │   ├── fragments/
    │       │   │   ├── header.html      # Header + Navigation (15KB)
    │       │   │   ├── footer.html
    │       │   │   ├── mini-cart.html    # Slide-out cart
    │       │   │   └── components.html  # Toast, loading, etc.
    │       │   ├── pages/ (16 files)
    │       │   │   ├── index.html       # Trang chủ
    │       │   │   ├── personal-center.html  # ⚠️ 105KB — Mega file!
    │       │   │   ├── product-detail.html   # 20KB
    │       │   │   ├── checkout.html         # 17KB
    │       │   │   ├── cart.html
    │       │   │   ├── login.html / register.html
    │       │   │   ├── order-detail.html
    │       │   │   ├── payment-summary.html
    │       │   │   ├── policy.html (22KB)
    │       │   │   └── ... (auth flows)
    │       │   ├── admin/
    │       │   │   ├── layouts/admin-layout.html
    │       │   │   ├── fragments/ (header, sidebar)
    │       │   │   └── pages/ (10 files)
    │       │   │       ├── dashboard.html
    │       │   │       ├── products.html
    │       │   │       ├── orders.html
    │       │   │       ├── customers.html
    │       │   │       ├── coupons.html
    │       │   │       ├── categories.html
    │       │   │       ├── reports.html
    │       │   │       ├── returns.html
    │       │   │       ├── offline-sale.html
    │       │   │       └── login.html
    │       │   └── mail/
    │       │       └── verification-email.html
    │       │
    │       └── static/                  # 📂 STATIC ASSETS
    │           ├── css/style.css        # ⚠️ Chỉ 107 bytes (hầu như rỗng)
    │           ├── images/
    │           ├── js/
    │           │   ├── main.js          # Global JS utilities
    │           │   ├── components/      # Shared JS modules
    │           │   │   ├── auth-utils.js
    │           │   │   ├── cart-utils.js
    │           │   │   ├── header.js (19KB)
    │           │   │   ├── live-search.js
    │           │   │   ├── mini-cart.js
    │           │   │   ├── notifications.js
    │           │   │   ├── toast.js
    │           │   │   └── wishlist-utils.js
    │           │   └── pages/           # Page-specific JS
    │           │       ├── cart-page.js (19KB)
    │           │       ├── checkout.js (24KB)
    │           │       ├── product-detail.js (14KB)
    │           │       ├── personal-center.js (14KB)
    │           │       ├── personal/    # Sub-modules for personal center
    │           │       │   ├── orders.js   (73KB!) ⚠️
    │           │       │   ├── manage.js   (15KB)
    │           │       │   ├── profile.js  (14KB)
    │           │       │   ├── wishlist.js (11KB)
    │           │       │   ├── coupons.js  (13KB)
    │           │       │   ├── order-detail.js (16KB)
    │           │       │   └── recently-viewed.js
    │           │       ├── login.js / register.js
    │           │       └── ... (auth pages)
    │           └── admin/
    │               ├── css/             # ⚠️ Empty (inline CSS in HTML)
    │               ├── images/
    │               └── js/
    │                   ├── admin-utils.js
    │                   ├── dashboard.js
    │                   ├── products.js (25KB)
    │                   ├── orders.js (26KB)
    │                   ├── customers.js (14KB)
    │                   ├── coupons.js (16KB)
    │                   ├── categories.js (10KB)
    │                   ├── reports.js (25KB)
    │                   ├── returns.js (20KB)
    │                   └── offline-sale.js (21KB)
    │
    └── test/                           # ⚠️ KHÔNG CÓ TEST THỰC TẾ
```

---

## 🏗️ II. KIẾN TRÚC HỆ THỐNG

### 2.1. Pattern Chính

| Pattern | Sử dụng | Đánh giá |
|---------|---------|----------|
| **Layered Architecture** | Controller → Service → Repository → Entity | ✅ Áp dụng đúng |
| **MVC (Server-Side Rendering)** | Thymeleaf + View Controllers | ✅ Rõ ràng |
| **REST API + SSR Hybrid** | API Controllers + View Controllers song song | ✅ Phù hợp |
| **Interface-based DI** | Service Interface → Impl | ✅ Hầu hết (có ngoại lệ) |
| **DTO Pattern** | Request/Response DTOs tách biệt | ✅ Tốt |
| **Builder Pattern** | Lombok @Builder cho DTO & Entity | ✅ Nhất quán |
| **Stateless JWT Auth** | Token-based, Cookies cho SSR | ✅ Phù hợp |

### 2.2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | Spring Boot 3.5.10 |
| Language | Java 21 |
| Database | MySQL (JPA/Hibernate) |
| Security | Spring Security 6 + JWT (jjwt 0.12.6) |
| View Engine | Thymeleaf + Layout Dialect |
| Frontend | Vanilla JS + Inline CSS |
| API Docs | SpringDoc OpenAPI (Swagger) |
| Email | Spring Mail (Gmail SMTP) |
| Payment | MoMo (Mock/Sandbox) |
| Build Tool | Maven |
| Other | Lombok, DevTools, Bean Validation |

---

## 💪 III. ĐIỂM MẠNH

### 3.1. Kiến Trúc
- ✅ **Phân tầng rõ ràng**: Controller → Service → Repository → Entity tuân theo convention Spring Boot.
- ✅ **Tách biệt API và View**: Thư mục `controller/api` và `controller/view` tách biệt hoàn toàn logic REST và SSR.
- ✅ **Interface-based Service**: Hầu hết service đều có Interface → Impl, dễ mở rộng và mock khi test.
- ✅ **DTO Pattern đầy đủ**: Tách biệt Request/Response, không để entity leak ra controller layer.

### 3.2. Tính Năng Nghiệp Vụ
- ✅ **Hệ thống đơn hàng phức tạp**: Quản lý status ở cấp độ OrderItem (không chỉ Order level), hỗ trợ partial cancel, partial return.
- ✅ **Quy trình xác thực email đầy đủ**: Register → Email verify → Active, đổi email → verify lại.
- ✅ **Tích hợp thanh toán**: MoMo sandbox với cơ chế retry payment, mock QR.
- ✅ **Hệ thống coupon**: Thu thập → Áp dụng → Tracking usage.
- ✅ **2FA (OTP)**: Cơ chế xác thực 2 lớp.
- ✅ **Offline Sale**: Bán hàng tại quầy (POS).
- ✅ **Admin Dashboard toàn diện**: Quản lý sản phẩm, đơn hàng, khách hàng, mã giảm giá, báo cáo doanh thu, xử lý trả hàng.

### 3.3. Kỹ Thuật
- ✅ **@Transactional đúng chỗ**: Các write operations đều có `@Transactional`, read operations có `@Transactional(readOnly = true)`.
- ✅ **Spring Security config chuẩn**: Stateless session, JWT filter chain, role-based authorization.
- ✅ **Pagination**: Sử dụng `Pageable` / `Page<>` cho các list endpoint.
- ✅ **@EnableScheduling**: OrderExpirationTask tự động hủy đơn hết hạn.
- ✅ **Environment variables**: DB credentials, JWT secret, Mail password đều dùng `${}`.

### 3.4. Tài liệu
- ✅ **UML diagrams**: Có đầy đủ UseCase, Sequence, Class, Activity, Object diagrams (PlantUML).
- ✅ **Comment bằng tiếng Việt**: Mọi business logic đều có comment giải thích step-by-step.
- ✅ **Swagger API docs**: Tích hợp SpringDoc OpenAPI.

---

## ⚠️ IV. ĐIỂM YẾU & VI PHẠM SOLID / BEST PRACTICES

### 4.1. Vi Phạm SOLID

#### 🔴 S — Single Responsibility Principle

| Vị trí | Vấn đề | Mức độ |
|--------|--------|--------|
| `OrderServiceImpl.java` (566 lines) | Xử lý quá nhiều: đặt hàng, áp dụng coupon, trừ kho, gửi thông báo, tính dashboard, cancel, revert inventory. Nên tách thành: `PlaceOrderService`, `InventoryService`, `CouponApplicationService`. | 🔴 Nghiêm trọng |
| `ProductServiceImpl.java` (373 lines) | Vừa CRUD Product, vừa quản lý Category (`getAllCategories()`). Category logic nên hoàn toàn thuộc `CategoryService`. | 🟡 Trung bình |
| `UserServiceImpl.java` (288 lines) | Trộn lẫn Customer profile management và Admin customer management trong cùng 1 class. | 🟡 Trung bình |
| `personal-center.html` (105KB!) | Một file HTML chứa toàn bộ UI: profile, orders, wishlist, coupons, reviews, settings... | 🔴 Nghiêm trọng |
| `orders.js` (73KB!) | Mega JS file xử lý tất cả tab orders, render, pagination, modals. | 🔴 Nghiêm trọng |
| `AuthServiceImpl.java` (376 lines) | Chứa cả register, login, logout, forgot/reset password, refresh token, email verify trong cùng 1 class. | 🟡 Trung bình |

#### 🟡 O — Open/Closed Principle

| Vị trí | Vấn đề |
|--------|--------|
| `GlobalExceptionHandler` | Catch `RuntimeException` tổng quát → mọi lỗi đều trả 400. Không có custom exception hierarchy → khó mở rộng thêm exception types mới. |
| `OrderServiceImpl.placeOrder()` | Logic coupon, inventory, payment bị hardcode trực tiếp → thêm payment method mới (VNPay, ZaloPay...) phải sửa service class. |
| `checkStatusTransition()` | State machine đơn giản chỉ kiểm tra CANCELLED/COMPLETED → không validate đầy đủ transition rules, muốn thêm rule mới phải sửa code. |

#### 🟡 I — Interface Segregation Principle

| Vị trí | Vấn đề |
|--------|--------|
| `OrderService` interface | Gom 8 method: placeOrder, getMyOrders, getMyOrderItems, getMyOrderDetail, cancelOrder, retryPayment, revertInventory, getDashboardSummary. Client nào chỉ cần đọc vẫn phải phụ thuộc vào methods viết. |
| `UserService` interface | Mix cả Customer self-service (getProfile, changePassword) lẫn Admin ops (getAllCustomers, updateCustomerStatus). |
| `ProductService` interface | Gồm cả public read ops (getProducts, getProductDetail) lẫn admin write ops (createProduct, updateProduct, deleteProduct) lẫn category ops (getAllCategories). |

#### 🟡 D — Dependency Inversion Principle

| Vị trí | Vấn đề |
|--------|--------|
| `MomoService.java` | Concrete class, không có interface → `OrderServiceImpl` phụ thuộc trực tiếp vào implementation. Không thể swap sang payment provider khác mà không sửa code. |
| `JwtService.java` | Concrete class, không có interface → tất cả nơi inject đều phụ thuộc cụ thể. |
| `OrderServiceImpl` constructor | 11 dependencies injected → quá nhiều, dấu hiệu SRP violation. |

#### ✅ L — Liskov Substitution Principle
- Không phát hiện vi phạm rõ ràng. Các Impl đều tuân thủ contract của Interface.

---

### 4.2. Vi Phạm Best Practices

#### 🔴 Exception Handling

```java
// ❌ Toàn bộ project throw RuntimeException trực tiếp
throw new RuntimeException("Sản phẩm không tồn tại!");
throw new RuntimeException("Mật khẩu không chính xác!");
throw new RuntimeException("Đơn hàng không tồn tại!");
```

**Vấn đề**: 
- Không có custom exception hierarchy (`NotFoundException`, `BusinessException`, `UnauthorizedException`...).
- `GlobalExceptionHandler` catch `RuntimeException` → Mọi lỗi đều trả `400 BAD_REQUEST`, kể cả `404 Not Found`.
- Không phân biệt lỗi client (4xx) và lỗi server (5xx).

**Nên có**:
```
exception/
├── BusinessException.java        # Base class (400)
├── ResourceNotFoundException.java # 404
├── UnauthorizedException.java     # 401
├── ForbiddenException.java        # 403
├── ConflictException.java         # 409
└── InternalServerException.java   # 500
```

#### 🔴 Thiếu Unit/Integration Test

- Thư mục `src/test/` hoàn toàn rỗng (không có test nào).
- Với 19 service packages, 24 API controllers → **0% test coverage**.
- Đây là vi phạm nghiêm trọng với bất kỳ dự án production nào.

#### 🔴 Duplicate Code

| Location | Code trùng lặp |
|----------|---------------|
| `UserServiceImpl` + `AuthServiceImpl` | `createVerificationToken()` và `capitalizeName()` **giống hệt nhau** — copy-paste giữa 2 class. |
| `ProductServiceImpl.getProducts()` + `getAdminProducts()` | Phần mapping Entity → DTO lặp lại 90% code. |
| `OrderManagementServiceImpl.getAllOrders()` + `OrderServiceImpl.convertToSummaryDTO()` | Logic convert Order → OrderSummaryResponseDTO lặp lại. |
| Các `.js` files | Pattern fetch API + error handling + toast notification lặp đi lặp lại hàng trăm lần. |

#### 🟡 Security Concerns

| Vấn đề | Vị trí |
|--------|--------|
| MoMo credentials trong properties | `application.properties` chứa hardcode: `momo.access-key`, `momo.secret-key` → Nên dùng env var hoặc vault. |
| `System.out.println` debug log | `MomoService.java:103` in signature ra console → lộ sensitive data. |
| JWT access token = 30 ngày | `jwt.access-token-expiration=2592000000` → Quá dài cho access token (nên 15-30 phút). |
| CSRF disabled hoàn toàn | `SecurityConfig` disable CSRF → hợp lý cho API stateless nhưng SSR forms cần bảo vệ. |

#### 🟡 Code Organization

| Vấn đề | Chi tiết |
|--------|----------|
| **Duplicate package: `util/` vs `utils/`** | Hai package utility bị chia tách vô nghĩa: `util.SecurityUtils` và `utils.MediaTypeUtils`. |
| **UML trong `src/main/java`** | PlantUML diagrams nằm trong Java source → không đúng chỗ, nên ở `docs/` hoặc root. |
| **CSS gần như rỗng** | `static/css/style.css` chỉ 107 bytes. Toàn bộ CSS inline trong HTML → khó maintain, không reusable. |
| **Admin CSS thư mục rỗng** | `static/admin/css/` là thư mục rỗng. |
| **Naming không nhất quán** | `cart_item/` (underscore) vs `email_log/` vs `wishlist_item/` — không theo Java convention: nên là `cartitem/` hoặc `cart/`. |

#### 🟡 Database / JPA

| Vấn đề | Chi tiết |
|--------|----------|
| `ddl-auto=update` | Nguy hiểm cho production, nên dùng Flyway/Liquibase migrations. |
| `Double` cho tiền tệ | `Order.totalAmount` dùng `Double` → floating-point precision issues. Nên dùng `BigDecimal`. |
| N+1 Query Risk | `User` entity có 10+ `@OneToMany` → dễ N+1 khi access lazy collections. |
| Thiếu DB indexes | Không thấy `@Index` annotation trên các column thường xuyên query (status, email, phone). |

#### 🟡 Frontend

| Vấn đề | Chi tiết |
|--------|----------|
| JS files quá lớn | `orders.js` = 73KB, `checkout.js` = 24KB, `products.js` = 25KB — monolithic, hard to maintain. |
| Inline CSS everywhere | Styling nằm trong `<style>` tags trong HTML thay vì external CSS files. |
| No build process | Không minify, bundle, hoặc tree-shake JS/CSS → performance kém. |
| API calls duplicated | Mỗi page file tự viết `fetch()` riêng, không có shared API client layer. |

---

## 🛤️ V. HƯỚNG PHÁT TRIỂN & CẢI THIỆN

### 5.1. Priority 1 — Critical (Nên làm ngay)

| # | Hành động | Lý do |
|---|-----------|-------|
| 1 | **Tạo Custom Exception Hierarchy** | Thay thế toàn bộ `RuntimeException` bằng `BusinessException`, `NotFoundException`... Cập nhật `GlobalExceptionHandler` trả đúng HTTP status. |
| 2 | **Tách SRP cho OrderServiceImpl** | Tách thành `PlaceOrderUseCase`, `OrderQueryService`, `InventoryService`. Giảm từ 566 → 3 class ~150 lines/each. |
| 3 | **Gộp util + utils** | Merge thành 1 package `util/`. |
| 4 | **Sửa JWT expiration** | Access token: 15-30 phút. Refresh token giữ nguyên 7 ngày. |
| 5 | **Dùng BigDecimal cho tiền tệ** | Thay `Double totalAmount` → `BigDecimal totalAmount` toàn bộ hệ thống. |

### 5.2. Priority 2 — Important (Nên cải thiện)

| # | Hành động | Lý do |
|---|-----------|-------|
| 6 | **Extract duplicate code** | Tạo `TokenHelper` / `NameHelper` shared giữa AuthService và UserService. |
| 7 | **Tách Interface theo ISP** | `OrderService` → `IOrderCommand` + `IOrderQuery`. `ProductService` → `IProductRead` + `IProductWrite`. |
| 8 | **Thêm Interface cho MomoService, JwtService** | Tuân thủ DIP, hỗ trợ mocking khi test. |
| 9 | **Tách personal-center.html** | Một file 105KB → tách thành fragments: `profile-tab.html`, `orders-tab.html`, `wishlist-tab.html`... |
| 10 | **Tách orders.js (73KB)** | Tách thành modules: `order-list.js`, `order-actions.js`, `order-renderer.js`. |
| 11 | **Viết Unit Tests** | Bắt đầu từ Service layer (AuthService, OrderService) → mục tiêu 60%+ coverage. |
| 12 | **Di chuyển UML diagrams** | Từ `src/main/java/.../uml/` → `docs/diagrams/`. |

### 5.3. Priority 3 — Nice to Have (Khi có thời gian)

| # | Hành động | Lý do |
|---|-----------|-------|
| 13 | **External CSS** | Chuyển inline styles ra external files, áp dụng CSS variables/design tokens. |
| 14 | **JS API Client Layer** | Tạo `apiClient.js` chung → tất cả fetch calls dùng chung base URL, auth header, error handling. |
| 15 | **DB Migration tool** | Flyway/Liquibase thay `ddl-auto=update`. |
| 16 | **Strategy Pattern cho Payment** | `PaymentStrategy` interface → `MomoPayment`, `CODPayment`, dễ thêm VNPay, ZaloPay. |
| 17 | **State Machine cho Order** | Dùng Spring Statemachine hoặc enum-based FSM thay vì if/else transition check. |
| 18 | **Caching** | Redis/Spring Cache cho product listing, category tree — giảm DB queries. |
| 19 | **Move MoMo secrets to env** | `momo.access-key`, `momo.secret-key` → dùng `${}` như JWT_SECRET. |
| 20 | **API Response wrapper** | Tạo `ApiResponse<T>` wrapper chuẩn: `{ success, data, message, errors }`. |
| 21 | **Mapper library** | MapStruct thay thế manual Entity↔DTO mapping → giảm boilerplate. |

---

## 📊 VI. THỐNG KÊ NHANH

| Metric | Số lượng |
|--------|---------|
| JPA Entities | 22 |
| Enums | 10 |
| Repository Interfaces | 23 |
| Service Packages | 19 |
| API Controllers | 24 |
| View Controllers | 8 |
| Request DTOs | 29 |
| Response DTOs | 30 |
| Thymeleaf Templates | 33 |
| JavaScript Files | 29 |
| Test Files | **0** ⚠️ |
| Total Java Files | ~130+ |

---

## 🎯 VII. KẾT LUẬN TỔNG

### Điểm Kiến Trúc: ⭐⭐⭐☆☆ (3/5)

**Dự án có nền tảng kiến trúc khá tốt** cho một đồ án cuối kỳ với phân tầng rõ ràng, DTO pattern chuẩn, và feature set phong phú. Tuy nhiên, **có nhiều technical debt** cần được giải quyết trước khi đưa vào production:

- **Tốt**: Layered architecture, DTO separation, JWT integration, Pagination, @Transactional, comment/docs tốt.
- **Cần cải thiện ngay**: Exception handling, SRP violations (OrderServiceImpl, personal-center.html), duplicate code, thiếu test hoàn toàn.
- **Cần cải thiện dần**: DIP violations (MomoService, JwtService), ISP (fat interfaces), inline CSS/monolithic JS, DB types (BigDecimal), security hardening.

> 💡 **Ưu tiên #1**: Custom Exception Hierarchy + Tách OrderServiceImpl → impact lớn nhất cho code quality và maintainability.
