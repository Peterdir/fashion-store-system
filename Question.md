Fix các phần còn đang mơ hồ:
1. UpdateCustomerStatusRequest tại sao lại có userId, 
2. tôi nghĩ nó phải nên nằm ở api của controller {id} vậy sẽ hợp lý hơn
3. Tách biệt Service (Decoupling): Frontend nên upload file lên một API chuyên biệt (hoặc thẳng lên S3/Cloudinary/Firebase), nhận lại danh sách String URLs, sau đó mới gọi API SubmitReturnRequest với body là JSON thuần tuý.
Điều chỉnh Spring Security trả về chuẩn lỗi 401 Unauthorized (Khuyên dùng) Trong chuẩn REST API, khi người dùng "chưa cung cấp token" thì đúng ra server cần trả về 401 Unauthorized thay vì 403 Forbidden (403 dùng khi "có token nhưng không đủ quyền", ví dụ Customer gọi API của Admin).