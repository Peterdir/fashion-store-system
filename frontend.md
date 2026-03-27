# H&Y | Digital Curator Frontend Structure

Tài liệu này mô tả chi tiết cấu trúc hệ thống Frontend của dự án Fashion Store (H&Y) để hỗ trợ việc kết nối dữ liệu từ Backend.

## 1. Công nghệ sử dụng (Tech Stack)
- **Thymeleaf**: Công cụ render HTML phía server.
- **Thymeleaf Layout Dialect**: Sử dụng để kế thừa giao diện (Template Inheritance).
- **Tailwind CSS (Play CDN)**: Sử dụng để thiết kế UI nhanh gọn trực tiếp trong HTML.
- **Vanilla JavaScript**: Xử lý các tương tác logic như Mega Menu, Scroll Menu và xử lý Form.
- **Material Symbols**: Hệ thống icon từ Google.

## 2. Cấu trúc Thư mục (Directory Structure)
Tọa lạc tại: `src/main/resources`

### `templates/`
- **`layouts/layout.html`**: File giao diện gốc, chứa `<head>`, Tailwind config mở rộng, và cấu trúc trang cơ bản.
- **`fragments/`**: Các thành phần tái sử dụng.
    - `header.html`: Thanh điều hướng 2 tầng tối ưu chiều cao (**48px + 32px**), Search Bar, Mega Menu.
    - `footer.html`: Chức thông tin cuối trang.
- **`pages/`**: Các trang nội dung cụ thể kế thừa từ `layout.html`.
    - `index.html`: Trang chủ.
    - `category.html`: Danh sách sản phẩm.
    - `product-detail.html`: Chi tiết sản phẩm.
    - `login.html`: Trang Đăng nhập (Sign In).
    - `register.html`: Trang Đăng ký (Sign Up).

### `static/`
- **`js/pages/`**: File JS logic riêng cho từng trang (ví dụ: `login.js`, `register.js`).
- **`images/`**: Tài nguyên hình ảnh (Logo, Mockups).

## 3. Cơ chế Kết nối Dữ liệu (Backend Connection)

### ViewController.java
Tương tác trực tiếp với các trang:
- `/` -> `pages/index.html`
- `/login` -> `pages/login.html`
- `/register` -> `pages/register.html`
- `/category` -> `pages/category.html` (Nhận `Page<ProductSummaryResponseDTO>`)
- `/product-detail/{id}` -> `pages/product-detail.html` (Nhận `ProductDetailResponseDTO`)

### Các chuẩn dữ liệu (DTO) cần thiết

#### `LoginRequestDTO` (Dùng cho Auth)
- `String email`: Email hoặc số điện thoại.
- `String password`: Mật khẩu.

#### `RegisterRequestDTO` (Dùng cho Auth)
- `String fullName`: Họ tên.
- `String phone`: Số điện thoại.
- `String email`: Email.
- `String password`: Mật khẩu.
- `String confirmPassword`: Xác nhận mật khẩu.

#### `ProductSummaryResponseDTO` (Dùng cho Danh mục)
- `Long id`: ID sản phẩm.
- `String name`: Tên sản phẩm.
- `BigDecimal price`: Giá sản phẩm.
- `String mainImageUrl`: Ảnh đại diện sản phẩm.

## 4. Các tính năng đặc biệt (Special Features)

### Bảo mật & Xử lý Lỗi (401/403)
- **401 Unauthorized**: Tự động trả về JSON thông báo yêu cầu đăng nhập khi token hết hạn.
- **403 Forbidden**: Trả về lỗi khi người dùng không đủ quyền truy cập tài nguyên.

### Mega Menu & Nav Scroll
- Hệ thống Menu 2 tầng được tối ưu hóa chiều cao để tăng không gian hiển thị nội dung chính.
- Mega Menu hỗ trợ hiển thị phân cấp chuyên mục sản phẩm.

---
*Lưu ý: Header đã được thu gọn (H12 + H8) để cải thiện trải nghiệm người dùng (UX).*
