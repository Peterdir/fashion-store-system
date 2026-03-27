# H&Y | Yêu cầu Dữ liệu Sản phẩm (Data Requirements)

Tài liệu này hướng dẫn các thành phần dữ liệu cần chuẩn bị để nhập vào cơ sở dữ liệu (Database), đảm bảo hiển thị đầy đủ và pixel-perfect trên giao diện H&Y Digital Curator.

## 1. Thành phần Sản phẩm Chính (Product)

Các thông tin cơ bản để định danh sản phẩm:

- **Tên Sản phẩm (Name)**:
    - *Yêu cầu*: Ngắn gọn, sang trọng (ví dụ: "H&Y Essential Oversized Blazer").
    - *Định dạng*: String, không được trùng lặp.
- **Danh mục (Category)**:
    - *Yêu cầu*: Phải khớp chính xác với các danh mục trong Header (ví dụ: "Quần áo nam", "Quần áo nữ", "Trang sức & Phụ kiện").
    - *Định dạng*: String.
- **Mô tả (Description)**:
    - *Yêu cầu*: Mô tả chi tiết về chất liệu, kiểu dáng và hướng dẫn sử dụng.
    - *Định dạng*: Text (có thể chứa HTML đơn giản).
- **Trạng thái (Status)**:
    - *Các giá trị*: `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `DISCONTINUED`.

---

## 2. Hình ảnh Sản phẩm (Product Images)

Hình ảnh là yếu tố quan trọng nhất để duy trì thẩm mỹ "Curator":

- **Loại hình ảnh**:
    - **Ảnh chính (Main Image)**: Hiện thị trên trang danh sách (Category page).
    - **Bộ sưu tập (Gallery)**: Hiển thị trên trang chi tiết (Product Detail).
- **Yêu cầu kỹ thuật**:
    - *Định dạng*: `.png` (nền trong suốt được ưu tiên) hoặc `.jpg` chất lượng cao.
    - *Nền (Background)*: Nên sử dụng nền đồng nhất (trắng hoặc xám nhạt) hoặc trong suốt để khớp với giao diện "Brutalist".
    - *Lưu trữ*: Lưu vào thư mục `src/main/resources/static/images/products/` hoặc sử dụng URL từ CDN (Cloudinary, S3).
- **Định dạng dữ liệu**: Link URL (ví dụ: `/images/products/blazer-white-01.png`).

---

## 3. Biến thể Sản phẩm (Product Variants)

Mỗi sản phẩm có thể có nhiều tổ hợp Size và Màu sắc khác nhau:

- **Kích thước (Size)**:
    - *Ví dụ*: S, M, L, XL, OS (One Size), hoặc Size số (28, 29, 30).
- **Màu sắc (Color)**:
    - *Yêu cầu*: Tên màu sắc (ví dụ: "Obsidian Black", "Pristine White", "Stone Gray").
    - *Lưu ý*: Sau này có thể cần mã Hex (ví dụ: #000000) để hiển thị ô màu.
- **Giá bán (Price)**:
    - *Định dạng*: Double/BigDecimal. Lưu ý: Giá được lưu ở cấp độ **Biến thể** (cho phép các size khác nhau có giá khác nhau).
- **Số lượng tồn kho (Stock Quantity)**:
    - *Định dạng*: Long (số nguyên dương).

---

## 4. Checklist Chuẩn bị Dữ liệu

| Thành phần | Dữ liệu cần tìm | Ghi chú |
| :--- | :--- | :--- |
| **Hình ảnh** | Ít nhất 3-4 ảnh/SP | 1 ảnh chính + ảnh góc nghiêng/chi tiết. |
| **Giá** | Giá gốc + Giá khuyến mãi | Xem xét giá cho từng phân loại. |
| **Size/Màu** | Bảng phân loại chi tiết | Ví dụ: Áo thun đen có S, M, L. |
| **Mô tả** | Đoạn văn 50-100 chữ | Viết theo phong cách tạp chí thời trang. |

---

*Lưu ý: Dữ liệu mẫu hiện tại trong project đang sử dụng các file ảnh p1.png, p2.png trong thư mục `/images/`.*
