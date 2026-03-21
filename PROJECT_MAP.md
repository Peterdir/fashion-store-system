# 🗺 PROJECT MAP: Fashion Store System

*Tài liệu hướng dẫn đọc hiểu Codebase dành cho Developer và AI Assistant.*

## 1. 🏗 Tổng quan kiến trúc hệ thống
Dự án sử dụng mô hình kiến trúc **N-Tier Architecture (Layered Architecture)** chuẩn của môi trường Spring Boot RESTful API.
Mẫu thiết kế chính đóng vai trò xương sống là **MVC (Model-View-Controller)**, tuy nhiên phần View được tách rời hoàn toàn (có thể là ứng dụng React/VueJS Front-end hoặc Mobile App giao tiếp thông qua định dạng JSON).

## 2. 📂 Cấu trúc thư mục (Directory Structure)
- `controller/`: Tầng giao tiếp (Presentation Layer). Đón nhận HTTP Requests từ Client, gọi Service, và trả về HTTP Responses.
- `service/`: Tầng nghiệp vụ (Business Logic Layer). Chứa toàn bộ "chất xám" cốt lõi. Quyết định các quy trình xử lý, tính toán giỏ hàng, xác thực. Không chứa logic kết nối database trực tiếp.
- `repository/`: Tầng truy cập dữ liệu (Data Access Layer). Kế thừa từ Spring Data JPA, chuyên trách câu lệnh CRUD với database.
- `entity/`: Tầng thực thể. Chứa các Object map 1-1 với cấu trúc bảng trong CSDL.
- `dto/`: (Data Transfer Object) Tòa tháp giao dịch thông tin. Bảo vệ Entity tránh bị lộ ra ngoài.
  - `request/`: Chứa các object hung đúc dữ liệu Inbound (Client -> Server).
  - `response/`: Chứa các object biểu diễn thông tin Outbound (Server -> Client).
- `uml/`: Chứa các file nguyên mẫu thiết kế hệ thống (Use Case, Activity, Sequence, Class Diagrams định dạng `.puml`).

## 3. 🔄 Luồng dữ liệu (Data Flow)
**Request** ➡️ `Controller` (Nhận Request DTO, Validate) ➡️ `Service` (Áp dụng Business Logic, Mapping DTO ↔ Entity) ➡️ `Repository` (Query/Save Entity từ DB, trả về lại Service) ➡️ `Service` (Mapping Entity ↔ Response DTO, trả về Controller) ➡️ `Controller` ➡️ **HTTP JSON Response** (Client).

## 4. 🧩 Các Entity chính & Fields cốt lõi
*(Lưu ý: Hệ thống hiện tại đang ở giai đoạn hoàn thiện Entity mapping cốt lõi, phần logic Controller/Service sẽ được rải dần sau).*

*   **`User`**: Chủ thể chính tương tác với ứng dụng.
    *   *Core fields*: `id`, `fullName`, `phone`, `email`, `password`, `address`, `status`, `role`, `twoFactorEnabled`, `verificationToken`.
*   **Authentication & Security** (Bảo mật 4 lớp gắn kết với `User`):
    *   `Token`: Access Token (ngắn hạn 15p). Có cờ `expired`, `revoked`.
    *   `RefreshToken`: Token sống dài hạn dùng reset Access Token cũ.
    *   `PasswordResetToken`: Quản lý quy trình khôi phục mật khẩu.
    *   `Otp`: Quản lý mã dùng 1 lần cho hệ thống xác thực 2 bước 2FA.
*   **`Product`**: Danh mục Hàng hóa cốt lõi.
    *   *Core fields*: `id`, `name`, `price`, `category`, `description`, `status`.
    *   *Relations*: `images` (List `ProductImage`), `variants` (List `ProductVariant`), `reviews` (List `Review`).
*   **`ProductImage`**: Hình ảnh chi tiết.
    *   *Core fields*: `id`, `url`.
*   **`ProductVariant`**: Biến thể cấu hình sản phẩm.
    *   *Core fields*: `id`, `size`, `color`, `stockQuantity`.
*   **`EmailLog`**: Ghi nhận lịch sử gửi Email.
*   **`Coupon`**: Mã giảm giá (khuyến mãi) do hệ thống phát hành.
    *   *Core fields*: `id`, `code`, `discountValue`, `discountType`, `startDate`, `expiryDate`, `minOrderAmount`, `usageLimit`, `active`.
*   **`UserCoupon`**: Bảng trung gian User ↔ Coupon, ghi nhận khách hàng đã thu thập mã nào.
    *   *Core fields*: `id`, `used`. *Relations*: `user` (ManyToOne), `coupon` (ManyToOne).
*   **`Review`**: Nhận xét từ người dùng.
    *   *Core fields*: `id`, `rating`, `comment`, `createdAt`. *Relations*: `user` (ManyToOne), `product` (ManyToOne).
*   **`WishlistItem`**: Bảng trung gian User ↔ Product cho tính năng "Mục yêu thích".
    *   *Core fields*: `id`. *Relations*: `user` (ManyToOne), `product` (ManyToOne).
*   **`CartItem`**: Bảng trung gian User ↔ ProductVariant cho tính năng "Giỏ hàng".
    *   *Core fields*: `id`, `quantity`. *Relations*: `user` (ManyToOne), `productVariant` (ManyToOne).
*   **`Order`**: Đơn hàng.
    *   *Core fields*: `id`, `orderDate`, `totalAmount`, `status`, `shippingAddress`, `paymentMethod`, `type`, `cancellationReason`, `refundStatus`.
    *   *Relations*: `user` (ManyToOne), `coupon` (ManyToOne, nullable), `orderItems` (List), `orderHistories` (List), `returnRequests` (List).
*   **`OrderItem`**: Chi tiết món hàng gắn trên Đơn hàng.
    *   *Core fields*: `id`, `quantity`, `price`, `productName`. *Relations*: `order` (ManyToOne), `productVariant` (ManyToOne), `returnRequest` (ManyToOne).
*   **`ReturnRequest`**: Yêu cầu hoàn trả sản phẩm.
    *   *Core fields*: `id`, `status`, `reason`, `description`, `requestDate`, `processedAt`, `rejectionReason`. *Relations*: `order` (ManyToOne), `user` (ManyToOne), `processedBy` (ManyToOne), `returnItems` (List OrderItem).
*   **`OrderHistory`**: Lưu vết trạng thái Log của việc vận hành Đơn hàng (Đang xử lý -> Đã gửi -> Hoàn thành).

## 5. 📦 Thiết kế & Triết lý DTO
- **Tách biệt Request / Response**: Tuân thủ nguyên tắc *Single Responsibility Principle*. Ví dụ: `LoginRequestDTO` (xác thực email/pass) sẽ tách biệt độc lập với `MessageResponseDTO` hay `LoginResponseDTO`.
- Khắc tinh của Serialization: Tuyệt đối không bao giờ trả `Entity` trực tiếp qua Controller. Entity luôn chứa các tham chiếu chéo (OneToMany/ManyToOne) gây lặp vô tận (Infinite Recursion) khi biến thành JSON. 

## 6. ⚙️ Quy tắc / Convention quan trọng
1.  **Lombok Power**: Codeback sạch sẽ nhờ các annotation `@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
2.  **Lazy Fetching Performance**: Mọi quan hệ `@ManyToOne`, `@OneToMany` bắt buộc phải kèm `fetch = FetchType.LAZY` để tối ưu N+1 Query.
3.  **Cascade & Orphan Lifecycle**: Nếu Object A chứa List Object B mang tính chất "Mẹ ẵm con" (`User` ẵm `Token` hay `Otp`), thì luôn đi kèm `cascade = CascadeType.ALL, orphanRemoval = true`.
4.  **Diagram-Driven Development**: Mọi Entity được code ra *phải tuân thủ và khớp 100%* với cấu trúc Class Diagram rải trong thư mục `uml/`. Không tự ý sáng tạo làm lệch nguyên mẫu. 

## 7. 🤖 Hướng dẫn nhận biết cho AI (AI Navigation Guide)
1.  **System Current State**: Dự án đang trong giai đoạn Setup Foundation cực kì vững chắc qua `entity` và `dto`.
2.  **Nguyên tắc thao tác Code mới**: Trước khi Assistant rẽ nhánh thêm Entity, *ƯU TIÊN LỚN NHẤT* là dùng `find_by_name` mò vào `src/main/java.../uml/` để tra khảo sơ đồ gốc của User. Quyết định Add hay Drop tính năng phụ thuộc trực tiếp vào Use Case Doc.
3.  **Authentication Flow Management**: Luồng Security đã rất chặt với 4 lớp (`Token`, `RefreshToken`, `PasswordResetToken`, `Otp`). Khi xử lý Logout Logic cho User, Assistant phải chủ động lặp update cờ `revoked = true` trọn gói cho toàn bộ những token này tương ứng trong Database.
