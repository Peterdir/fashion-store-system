Fix các phần còn đang mơ hồ:
1. UpdateCustomerStatusRequest tại sao lại có userId, 
2. tôi nghĩ nó phải nên nằm ở api của controller {id} vậy sẽ hợp lý hơn
3. Tách biệt Service (Decoupling): Frontend nên upload file lên một API chuyên biệt (hoặc thẳng lên S3/Cloudinary/Firebase), nhận lại danh sách String URLs, sau đó mới gọi API SubmitReturnRequest với body là JSON thuần tuý.