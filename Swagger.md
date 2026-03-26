BƯỚC 1: Thêm gói thư viện tự động render API vào Spring Boot
Mở file pom.xml của project và thêm dependency này vào trong block <dependencies> (Giả sử bạn đang dùng Spring Boot 3.x và Java 21):

xml
<dependency>
<groupId>org.springdoc</groupId>
<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
<version>2.3.0</version>
</dependency>
(Sau đó nhớ bấm nút Load/Refresh Maven ở góc phải IntelliJ để tải thư viện về).

BƯỚC 2: Khởi động Server và kiểm tra
Chạy ứng dụng Spring Boot của bạn. Mở trình duyệt và truy cập vào đường dẫn sau: 👉 http://localhost:8080/v3/api-docs

Bạn sẽ thấy một trang chứa toàn bộ chữ JSON xám xịt. Đừng lo, copy URL đó lại! (Nếu muốn xem giao diện web UI của Swagger cực đẹp, bạn có thể vào http://localhost:8080/swagger-ui/index.html - bạn thậm chí có thể test API trực tiếp trên web mà không cần Postman!)

BƯỚC 3: Nhập (Import) 1 click vào Postman
Mở Postman lên.
Ở góc trên cùng bên trái của màn hình hoặc phần Workspace, tìm chữ "Import" lớn.
Trong hộp thoại Import, dán đường dẫn http://localhost:8080/v3/api-docs vào ô tìm kiếm/nhập liệu.
Bấm Import.
🎉 Kết quả: Postman sẽ tự động tạo ra một thư mục (Collection) có tên "OpenAPI definition" chứa HÀNG TRĂM API có sẵn của bạn.

Mọi API đã được phân loại theo từng Thư mục (

ProductController
,

UserController
...).
Tất cả các Params (@RequestParam), Path Variables (@PathVariable) đã được điền sẵn ô trống để bạn nhập số.
Chỗ body (@RequestBody), Postman tự động sinh ra một file JSON mẫu dựa theo các thuộc tính trong ruột các file

DTO
của bạn.
Mẹo nâng cao (Authorization): Vì dự án của bạn có các API cần Token, bạn chỉ cần bấm chuột phải vào thư mục gốc của Collection vừa được Import $\rightarrow$ Chọn Edit $\rightarrow$ Tab Authorization $\rightarrow$ Chọn Type là Bearer Token và dán mã JWT của bạn vào. Tự động hàng trăm API bên trong thư mục đó sẽ được gắn kèm Token mà không cần copy/paste mỗi lần test!