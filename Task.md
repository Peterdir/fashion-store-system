Dựa vào project Spring Boot của tôi (Entity, Repository, Service, Sequence Diagram nếu có),
hãy thiết kế Controller API với các yêu cầu:

1. Tuân thủ SOLID:
   - Single Responsibility: Controller chỉ nhận request và gọi Service, không chứa business logic
   - Open/Closed: Thiết kế dễ mở rộng, không hardcode
   - Liskov Substitution: Service interface rõ ràng, không phụ thuộc implementation
   - Interface Segregation: Không tạo API dư thừa, mỗi API phục vụ đúng mục đích
   - Dependency Inversion: Controller chỉ phụ thuộc vào Service interface

2. Thiết kế đầy đủ API:
   - CRUD cho mỗi entity
   - Các nghiệp vụ từ Sequence Diagram
   - Các chức năng hợp lý (search, filter, pagination, status update...)

3. Với mỗi API, mô tả rõ:
   - HTTP method
   - URL
   - Service interface method được gọi (không dùng implementation)
   - Request DTO
   - Response DTO

4. Nếu Service hiện tại chưa đủ:
   - Đề xuất bổ sung method vào Service interface

5. KHÔNG viết code Java, chỉ thiết kế API

6. Output dạng Markdown rõ ràng theo từng module

7. Đảm bảo Controller không chứa business logic, chỉ đóng vai trò điều phối