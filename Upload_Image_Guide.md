# Hướng Dẫn Chi Tiết: Xử Lý Upload Ảnh (Tách Biệt Multipart & JSON)

Bởi vì hệ thống của bạn đã chuyển sang lưu `imageUrls` (dạng chuỗi URL) thay vì nhận trực tiếp file ảnh (`Multipart`) trong các API nghiệp vụ (như `ReturnRequest`), luồng upload ảnh của bạn hiện tại sẽ được thay đổi theo quy chuẩn Microservices / Hiện đại.

Dưới đây là hướng dẫn từ A-Z để bạn có thể implement sau này.

---

## 1. Luồng Hoạt Động Mới (The New Flow)

Thay vì gộp chung, quá trình gửi yêu cầu có kèm ảnh sẽ diễn ra qua **2 bước độc lập**:

*   **Bước 1 (Client gọi Upload API):** Người dùng chọn ảnh $\rightarrow$ Frontend gửi ảnh lên một API Upload riêng biệt dạng `multipart/form-data` $\rightarrow$ Server lưu ảnh và trả về danh sách các URL hợp lệ (ví dụ: `https://your-domain.com/uploads/img1.jpg`).
*   **Bước 2 (Client gọi Business API):** Frontend lấy danh sách URL đó, gắn vào JSON body của DTO (`SubmitReturnRequestDTO.imageUrls`) $\rightarrow$ Gửi lên API `POST /api/return-requests` dạng `application/json`.

---

## 2. Các Lựa Chọn Nơi Lưu Trữ Ảnh

Bạn có 2 lựa chọn chính để lưu trữ file vật lý:

### Phương án A: Lưu trữ Local (Trong App Server) - *Dễ làm nhất*
*   **Nguyên lý:** Lưu file thẳng vào một thư mục trên ổ cứng của server chạy Spring Boot (ví dụ: `C:/uploads/` hoặc `./uploads/`).
*   **Ưu điểm:** Cực kỳ dễ code, không tốn phi dịch vụ bên ngoài.
*   **Nhược điểm:** Khi server restart hoặc deploy app lên server mới (Ví dụ dùng Docker), dữ liệu ảnh có thể bị mất. Không chịu tải tốt nếu có hàng triệu ảnh.

### Phương án B: Lưu trữ Cloud (AWS S3, Cloudinary, Firebase) - *Best Practice*
*   **Nguyên lý:** App Spring Boot đóng vai trò trung gian đẩy ảnh lên Cloud Server, Cloud Server trả về URL tĩnh.
*   **Ưu điểm:** Chuyên nghiệp, an toàn, hỗ trợ CDN giúp load ảnh cực nhanh, server Spring Boot của bạn sẽ rất nhẹ.
*   **Nhược điểm:** Tốn công setup tài khoản Cloud, phải tích hợp SDK (ví dụ `aws-java-sdk-s3` hoặc `cloudinary-http44`).

---

## 3. Code Mẫu Gợi Ý (Dành cho Phương án A - Lưu Local)

Khuyến nghị bạn tạo một `UploadController` riêng biệt chuyên dùng để xử lý File.

### 3.1. Upload API (Controller & Service)

```java
@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    // Đây là API dùng chung cho toàn bộ project (Upload Avatar, Upload Ảnh Sản Phẩm, Upload Ảnh ReturnRequest...)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<String>> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        List<String> fileUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            // 1. Tạo tên file duy nhất tránh chép đè (Dùng UUID)
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            // 2. Lưu file vào ổ cứng (Ví dụ: thư mục "uploads" trong project project)
            Path uploadPath = Paths.get("uploads/");
            if (!Files.exists(uploadPath)) { Files.createDirectories(uploadPath); }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // 3. Tạo URL để Client có thể xem được ảnh (Cần cấu hình WebMvcConfigurer để map URL này)
            String fileUrl = "http://localhost:8080/files/" + fileName;
            fileUrls.add(fileUrl);
        }
        
        return ResponseEntity.ok(fileUrls);
    }
}
```

### 3.2. Cầu hình Spring Boot để xem ảnh (WebMvcConfigurer)

Spring Boot mặc định chặn truy cập vào thư mục ngoài. Để biến thư mục `uploads/` thành thư mục chứa file tĩnh cho Client đọc thông qua đường dẫn `http://localhost:8080/files/...`, bạn cần thêm Config sau:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ánh xạ URL prefix /files/** vào thư mục vật lý "uploads"
        registry.addResourceHandler("/files/**")
                .addResourceLocations("file:uploads/");
    }
}
```

---

## 4. Tích Hợp Ở Phía Frontend (Ví dụ với React/Vue/JS thuần)

Khi người dùng ấn nút "Gửi Yêu Cầu Hoàn Trả", luồng code Javascript/Typescript của bạn sẽ như sau:

```javascript
async function submitReturnRequest(selectedFiles, reason, orderId) {
    // BƯỚC 1: UP ẢNH LÊN UPLOAD API TRƯỚC
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));

    const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
    });
    
    // Server trả về mảng URLs: ["http://.../img1.jpg", "http://.../img2.jpg"]
    const uploadedImageUrls = await uploadResponse.json(); 

    // BƯỚC 2: GÓI URL ẢNH VÀO DTO JSON VÀ GỬI LÊN RETURN REQUEST API
    const requestDTO = {
        orderId: orderId,
        reason: reason,
        description: "Hàng bị lỗi...",
        imageUrls: uploadedImageUrls // <--- Truyền mảng String vào đây!
    };

    const finalResponse = await fetch('/api/return-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestDTO)
    });

    console.log("Xong! Yêu cầu trả hàng đã được tạo.", await finalResponse.json());
}
```

---

## 5. Lời Khuyên Dự Án (Best Practice cho Project Tốt Nghiệp)
* Tạm thời hãy dùng **Phương Án A (Lưu Local)** để nhanh chóng hoàn thành và test chức năng. 
* Khi nào project của bạn đã hoàn thiện mọi logic, nếu có thừa thời gian, hãy đăng ký 1 tài khoản **Cloudinary** (Miễn phí) rồi thay thế ruột của `UploadController` gọi SDK của Cloudinary. Giảng viên sẽ đánh giá rất cao hệ thống có đụng tới Cloud!
