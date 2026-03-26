# H&Y | Digital Curator Frontend Structure

Tài liệu này mô tả chi tiết cấu trúc hệ thống Frontend của dự án Fashion Store (H&Y) để hỗ trợ việc kết nối dữ liệu từ Backend.

## 1. Công nghệ sử dụng (Tech Stack)
- **Thymeleaf**: Công cụ render HTML phía server.
- **Thymeleaf Layout Dialect**: Sử dụng để kế thừa giao diện (Template Inheritance).
- **Tailwind CSS (Play CDN)**: Sử dụng để thiết kế UI nhanh gọn trực tiếp trong HTML.
- **Vanilla JavaScript**: Xử lý các tương tác logic như Mega Menu và Scroll Menu.

## 2. Cấu trúc Thư mục (Directory Structure)
Tọa lạc tại: `src/main/resources`

### `templates/`
- **`layouts/layout.html`**: File giao diện gốc, chứa `<head>`, Tailwind config, và cấu trúc trang cơ bản (Header, Main, Footer).
- **`fragments/`**: Các thành phần tái sử dụng.
    - `header.html`: Chứa thanh điều hướng 2 tầng, Search Bar, Mega Menu, và logic Scroll.
    - `footer.html`: Chứa thông tin cuối trang.
- **`pages/`**: Các trang nội dung cụ thể kế thừa từ `layout.html`.
    - `index.html`: Trang chủ.
    - `category.html`: Trang danh sách sản phẩm.
    - `product-detail.html`: Trang chi tiết sản phẩm.

### `static/`
- **`css/`**: Chứa CSS tùy chỉnh bổ sung.
- **`js/`**: Chứa các file JavaScript logic.
- **`images/`**: Chứa tài nguyên hình ảnh (Logo, Favicon, Banner, Product Mockups).

## 3. Cơ chế Kết nối Dữ liệu (Backend Connection)

### ViewController.java
Tương tác trực tiếp với các trang:
- `/` -> `pages/index.html`
- `/category` -> `pages/category.html` (Nhận `Page<ProductSummaryResponseDTO>`)
- `/product-detail/{id}` -> `pages/product-detail.html` (Nhận `ProductDetailResponseDTO`)

### Các chuẩn dữ liệu (DTO) cần thiết
Cấu trúc các đối tượng này phải khớp với các thẻ `th:each` và `th:text` trong HTML:

#### `ProductSummaryResponseDTO` (Dùng cho Category)
- `Long i`: ID sản phẩm.
- `String name`: Tên sản phẩm.
- `BigDecimal price`: Giá sản phẩm.
- `String mainImageUrl`: Ảnh đại diện sản phẩm (Mockup hiện tại dùng `/images/p1.png`).

#### `ProductDetailResponseDTO` (Dùng cho Product Detail)
- `Long id`: ID sản phẩm.
- `String name`: Tên sản phẩm.
- `BigDecimal price`: Giá.
- `String description`: Mô tả sản phẩm.
- `List<String> imageUrls`: Bộ sưu tập ảnh.

## 4. Các tính năng đặc biệt (Special Features)

### Mega Menu (H&Y)
- Hoạt động dựa trên sự kiện `mouseenter/mouseleave` trên thanh điều hướng.
- Sử dụng mã nhúng JS trong `header.html` để điều khiển hiển thị.
- Dữ liệu trong Mega Menu hiện đang được Hardcoded (Men, Women, Kids...).

### Category Scroll Menu
- Một thanh danh mục nằm ngang bên dưới thanh Search.
- Có nút điều hướng `<` và `>` chỉ xuất hiện khi hover.
- Sử dụng JavaScript để xử lý cuộn mượt mà và tự động ẩn nút khi chạm biên.

---
*Lưu ý: Để thay đổi thương hiệu, hãy cập nhật lại tên thương hiệu trong `header.html` và favicon trong `layout.html`.*
