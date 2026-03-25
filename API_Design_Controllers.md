# Thiết kế REST API Controllers - Fashion Store System

Tài liệu này mô tả thiết kế các Controller API cho hệ thống, tuân thủ các nguyên tắc SOLID, đặc biệt là **Single Responsibility** (Controller chỉ điều phối, không chứa business logic) và **Dependency Inversion** (Controller gọi qua Service Interface).

---

## 1. Auth Module (`AuthController`)
*Endpoint base:* `/api/v1/auth`

| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Đăng ký | POST | `/register` | `registerNewAccount(dto)` | `RegisterRequestDTO` | `RegisterResponseDTO` |
| Đăng nhập | POST | `/login` | `login(dto)` | `LoginRequestDTO` | `LoginResponseDTO` |
| Đăng xuất | POST | `/logout` | `logout(dto)` | `LogoutRequestDTO` | `MessageResponseDTO` |
| Xác thực Email | POST | `/verify-email` | `verifyEmail(dto)` | `VerifyEmailRequestDTO` | `Boolean` |
| Gửi lại Email xác thực | POST | `/resend-verification` | `resendVerificationEmail(dto)` | `ResendVerificationEmailRequestDTO` | `Boolean` |
| Quên mật khẩu | POST | `/forgot-password` | `forgotPassword(dto)` | `ForgotPasswordRequestDTO` | `MessageResponseDTO` |
| Đặt lại mật khẩu | POST | `/reset-password` | `resetPassword(dto)` | `ResetPasswordRequestDTO` | `MessageResponseDTO` |

---

## 2. User/Customer Module (`UserController`)
*Endpoint base:* `/api/v1/users`

### Dành cho Customer (Cần Authenticated User)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Xem thông tin cá nhân | GET | `/me` | `getProfile(userId)` | *None (lấy userId từ token)* | `ProfileResponseDTO` |
| Cập nhật thông tin | PUT | `/me` | `updateProfile(userId, dto)` | `UpdateProfileRequestDTO` | `ProfileResponseDTO` |
| Đổi mật khẩu | PUT | `/me/password` | `changePassword(userId, dto)` | `ChangePasswordRequestDTO` | `MessageResponseDTO` |

### Dành cho Admin (`AdminUserController`)
*Endpoint base:* `/api/v1/admin/customers`
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Danh sách KH (Search/Paginate) | GET | `/` | `getAllCustomers(keyword)` | *Params: keyword* | `List<CustomerSummaryResponseDTO>` |
| Xem chi tiết KH | GET | `/{id}` | `getCustomerDetail(customerId)` | *Path Variable: id* | `CustomerDetailResponseDTO` |
| Cập nhật trạng thái KH | PATCH | `/{id}/status` | `updateCustomerStatus(customerId, dto)`| `UpdateCustomerStatusRequestDTO` | `MessageResponseDTO` |

---

## 3. Product Module (`ProductController`)
*Endpoint base:* `/api/v1/products`

### Public APIs
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy danh sách (Search/Filter)* | GET | `/` | `getProducts(keyword)` | *Params: keyword* | `List<ProductSummaryResponseDTO>` |
| Xem chi tiết sản phẩm | GET | `/{id}` | `getProductDetail(productId)`| *Path Variable: id* | `ProductDetailResponseDTO` |

### Admin APIs (`AdminProductController`)
*Endpoint base:* `/api/v1/admin/products`
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Thêm sản phẩm | POST | `/` | `createProduct(dto)` | `CreateProductRequestDTO` | `ProductDetailResponseDTO` |
| Cập nhật sản phẩm | PUT | `/{id}` | `updateProduct(productId, dto)` | `UpdateProductRequestDTO` | `ProductDetailResponseDTO` |
| Xóa sản phẩm | DELETE | `/{id}` | `deleteProduct(productId)` | *Path Variable: id* | *No Content (204)* |

---

## 4. Cart Module (`CartController`)
*Endpoint base:* `/api/v1/cart`

| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Xem giỏ hàng | GET | `/` | `getCartItems(userId)` | *None* | `List<CartItemResponseDTO>` |
| Thêm vào giỏ | POST | `/` | `addToCart(userId, dto)` | `AddToCartRequestDTO` | `CartItemResponseDTO` |
| Cập nhật số lượng | PUT | `/items` | `updateCartItem(userId, dto)` | `UpdateCartItemRequestDTO` | `CartItemResponseDTO` |
| Xóa khỏi giỏ | DELETE | `/items/{itemId}` | `removeCartItem(userId, cartItemId)` | *Path Variable: itemId* | `MessageResponseDTO` |

---

## 5. Order & Payment Module (`OrderController` & `PaymentController`)

### Customer Order (`/api/v1/orders`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Đặt hàng | POST | `/` | `placeOrder(dto)` | `PlaceOrderRequestDTO` | `PlaceOrderResponseDTO` |
| Lấy danh sách đơn hàng | GET | `/` | `getMyOrders(userId)` | *None* | `List<OrderSummaryResponseDTO>` |
| Xem chi tiết đơn hàng | GET | `/{id}` | `getMyOrderDetail(userId, orderId)` | *Path Variable: id* | `OrderDetailResponseDTO` |
| Hủy đơn hàng | POST | `/{id}/cancel` | `cancelOrder(userId, orderId, dto)` | `CancelOrderRequestDTO` | `MessageResponseDTO` |

### Payment (`/api/v1/payments`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Xử lý thanh toán | POST | `/process` | `processPayment(dto)` | `ProcessPaymentRequestDTO` | `PaymentResponseDTO` |

### Admin Order Management (`/api/v1/admin/orders`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Danh sách tất cả ĐH | GET | `/` | `getAllOrders()` | *None* | `List<OrderSummaryResponseDTO>` |
| Xem chi tiết ĐH | GET | `/{id}` | `getOrderDetail(orderId)` | *Path Variable: id* | `OrderDetailResponseDTO` |
| Cập nhật trạng thái ĐH | PATCH | `/{id}/status` | `updateOrderStatus(orderId, status)` | `Enum: OrderStatus` (Param/Body) | `MessageResponseDTO` |
| Cập nhật TT SP trong ĐH | PATCH | `/items/{itemId}/status` | `updateOrderItemStatus(itemId, newStatus)`| `Enum: OrderStatus` (Param/Body) | *No Content (204)* |

---

## 6. Coupon Module (`CouponController`)

### Customer Coupon (`/api/v1/coupons`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Xem danh sách mã | GET | `/` | `getAvailableCoupons(userId)` | *None* | `List<CouponResponseDTO>` |
| Thu thập mã giảm giá | POST | `/collect` | `collectCoupon(userId, dto)` | `CollectCouponRequestDTO` | `MessageResponseDTO` |
| Áp dụng mã cho ĐH | POST | `/apply` | `applyCoupon(userId, dto, currentTotal)`| `ApplyCouponRequestDTO` (+ Params) | `ApplyCouponResponseDTO` |

### Admin Coupon (`/api/v1/admin/coupons`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Xem tất cả mã | GET | `/` | `getAllCoupons()` | *None* | `List<CouponResponseDTO>` |
| Xem chi tiết mã | GET | `/{id}` | `getCouponDetail(couponId)` | *Path Variable: id* | `CouponResponseDTO` |
| Tạo mã giảm giá | POST | `/` | `createCoupon(dto)` | `CreateCouponRequestDTO` | `CouponResponseDTO` |
| Cập nhật mã | PUT | `/{id}` | `updateCoupon(couponId, dto)` | `UpdateCouponRequestDTO` | `CouponResponseDTO` |
| On/Off trạng thái mã | PATCH | `/{id}/toggle-status` | `toggleCouponStatus(couponId)` | *Path Variable: id* | `MessageResponseDTO` |

---

## 7. Return Request Module (`ReturnRequestController`)

### Customer Return (`/api/v1/return-requests`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy DS yêu cầu trả hàng | GET | `/` | `getReturnRequestsByCustomer(userId)` | *None* | `List<ReturnRequestResponseDTO>` |
| Gửi yêu cầu trả hàng | POST | `/` | `submitReturnRequest(dto)` | `SubmitReturnRequestDTO` (JSON)| Object `ReturnRequest` |

### Admin Return (`/api/v1/admin/return-requests`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy tất cả yêu cầu | GET | `/` | `getAllReturnRequests()` | *None* | `List<ReturnRequestResponseDTO>` |
| Xem chi tiết yêu cầu | GET | `/{id}` | `getReturnRequestDetail(requestId)`| *Path Variable: id* | `ReturnRequestResponseDTO` |
| Xử lý yêu cầu trả hàng | POST | `/{id}/process`| `processReturnRequest(requestId, dto)` | `ProcessReturnRequestDTO` | `MessageResponseDTO` |

---

## 8. Wishlist & Review Module (`WishlistController` & `ReviewController`)

### Wishlist (`/api/v1/wishlists`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lấy danh sách yêu thích | GET | `/` | `getWishlist(userId)` | *None* | `List<WishlistItemResponseDTO>` |
| Bật/tắt yêu thích (Toggle) | POST | `/toggle` | `toggleWishlist(userId, productId)`| *Params: productId* | `WishlistToggleResponseDTO` |
| Xóa khỏi danh sách | DELETE | `/{itemId}` | `removeWishlistItem(userId, itemId)` | *Path Variable: itemId* | *No Content (204)* |

### Review (`/api/v1/reviews`)
| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Thêm đánh giá | POST | `/` | `submitReview(userId, dto)` | `SubmitReviewRequestDTO` | `MessageResponseDTO` |

---

## 9. Offline Sale Module (`OfflineSaleController`)
*Endpoint base:* `/api/v1/admin/offline-sales`

| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Ghi nhận bán trực tiếp | POST | `/` | `recordOfflineSale(dto)` | `RecordOfflineSaleRequestDTO` | `PlaceOrderResponseDTO` |

---

## 10. Revenue & Report Module (`ReportController`)
*Endpoint base:* `/api/v1/admin/reports`

| Chức năng | HTTP Method | URL | Service Method (Interface) | Request DTO | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Xem báo cáo doanh thu | GET | `/revenue` | `getDetailedRevenueReport(start, end)` | *Params: startDate, endDate* | `RevenueReportDTO` |
| Xuất báo cáo doanh thu | GET | `/revenue/export`| `exportRevenueReport(start, end, format)`| *Params: start, end, format* | `byte[]` (File Download) |

---

## 🔥 Đề xuất Bổ sung / Chỉnh sửa Interface cho Service
Qua quá trình phân tích thiết kế Controller, tôi nhận thấy các Service Interface hiện tại cần được bổ sung một số tham số (parameters) để hệ thống hoạt động thực tế hơn (đặc biệt trong việc search, filter và phân trang - Pagination), bao gồm:

1. **`ProductService`**:
   - `getProducts(String keyword)`: **Nên bổ sung** thêm `Pageable pageable` hoặc `int page, int size` để phân trang danh sách sản phẩm. Ngoài ra tham số `categoryId` cũng rất quan trọng nếu cần lọc theo danh mục.

2. **`UserService`**:
   - `getAllCustomers(String keyword)`: **Nên bổ sung** thông tin phân trang `Pageable`. Không nên load một lần toàn bộ người dùng.

3. **`OrderManagementService`**:
   - `getAllOrders()`: **Cần bổ sung** các tham số lọc như `status`, `startDate`, `endDate`, và `Pageable` phân trang. List toàn bộ order của hệ thống mà không có phân trang sẽ gây quá tải memory.

4. **`CouponService`**:
   - `getAllCoupons()`: Tương tự, **cần có `Pageable`** để phân trang.

5. **`ReturnRequestService`**:
   - `getAllReturnRequests()`: **Đòi hỏi `Pageable`** do số lượng record theo thời gian sẽ nhiều.

> ***Quy chuẩn Controller:*** Toàn bộ API Controller nêu trên chỉ đóng vai trò nhận HTTP Request, trích xuất dữ liệu, pass qua cho `Service` xử lý (phù hợp với SOLID/Liskov Substitution/DIP) và bọc kết quả từ Service dưới dạng `ResponseEntity` hợp lệ (kèm HTTP Status 200, 201, 204...).
