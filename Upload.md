# Hướng dẫn Quản lý Ảnh (Upload & Optimization)

Tài liệu này tổng hợp các quy tắc và hướng dẫn triển khai hệ thống upload ảnh cho dự án Fashion Store nhằm đạt trải nghiệm người dùng (UX) tốt nhất và hiệu suất tối ưu.

## 1. Quy trình Upload Giao diện (UX)

Thay vì chọn ảnh xong chờ bấm submit Product mới upload, chúng ta sẽ làm theo quy trình:
1.  **Chọn ảnh**: Người dùng chọn file từ máy tính.
2.  **Auto-upload**: JavaScript gọi API `/api/admin/images/upload` ngay lập tức.
3.  **Preview & Metadata**: Nhận về `url` và `publicId`. Hiển thị ảnh preview lên màn hình.
4.  **Hoàn tất**: Khi lưu sản phẩm, chỉ cần gửi danh sách các `url` và `publicId` đã nhận được.

## 2. Cấu trúc Dữ liệu Sản phẩm

Mỗi bức ảnh cần lưu trữ đủ các thông tin sau:
- `url`: Đường dẫn hiển thị.
- `publicId`: Dùng để quản lý xóa/sửa trên Cloudinary.
- `isPrimary`: Xác định ảnh nào là ảnh đại diện (thumbnail).
- `sortOrder`: Thứ tự hiển thị (1, 2, 3...).

## 3. Tối ưu hóa Hiệu suất (Image Transformation)

Luôn sử dụng các tham số tối ưu của Cloudinary khi hiển thị ảnh:
- **`q_auto`**: Tự động nén chất lượng mà mắt thường không nhận ra sự khác biệt.
- **`f_webp`**: Tự động chuyển sang định dạng WebP (nhẹ hơn 30% so với JPG).
- **`w_500`**: Resize ảnh về kích thước cần thiết (ví dụ: danh sách sản phẩm chỉ cần 500px).

**Ví dụ URL tối ưu:**
`https://res.cloudinary.com/demo/image/upload/w_500,q_auto,f_webp/sample.jpg`

## 4. Xử lý Lỗi & Bảo mật

- **Validation**: Kiểm tra MIME type (chỉ nhận `image/jpeg`, `image/png`, `image/webp`).
- **Dung lượng**: Giới hạn tối đa 5MB mỗi ảnh.
- **Xử lý xóa**: Luôn gọi lệnh `destroy(publicId)` khi người dùng nhấn nút "Xóa" trên giao diện hoặc khi xóa sản phẩm.

## 5. Danh sách API cần triển khai

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/admin/images/upload` | Tải ảnh lên Cloudinary, trả về URL & publicId |
| `DELETE` | `/api/admin/images/{publicId}` | Xóa trực tiếp ảnh trên Cloudinary |

---
*Tài liệu này được soạn thảo để đảm bảo hệ thống Fashion Store hoạt động ổn định và chuyên nghiệp như các sàn TMĐT lớn (Shopee, Shein).*
