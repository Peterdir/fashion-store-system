# Kế hoạch Kiến trúc Frontend: Thymeleaf + JavaScript + Tailwind CSS

Bản kế hoạch này phác thảo việc triển khai giao diện hiện đại, phản hồi tốt cho hệ thống Fashion Store bằng cách sử dụng Thymeleaf của Spring Boot, Tailwind CSS và Vanilla JavaScript.

## 1. Kiến trúc Tổng thể

Kiến trúc tuân theo cách tiếp cận lai (hybrid):
- **Server-Side Rendering (SSR)**: Thymeleaf render HTML ban đầu, layout và nội dung tĩnh (tốt cho SEO).
- **Client-Side Logic (AJAX/Fetch)**: JavaScript xử lý các tương tác động, gọi API (JWT) và cập nhật UI mà không cần tải lại toàn bộ trang.

```mermaid
graph TD
    Client[Trình duyệt] <--> Controller[View Controller @Controller]
    Client <--> API[REST Controller @RestController]
    Controller --> Service[Dịch vụ Nghiệp vụ]
    API --> Service
    Service --> DB[(Cơ sở dữ liệu)]
    
    subgraph Frontend
        Thymeleaf[Thymeleaf Templates]
        JS[JavaScript Modules]
        Tailwind[Tailwind CSS]
    end
    
    Client -- Yêu cầu HTML --> Controller
    Controller -- Render --> Thymeleaf
    Client -- Gọi AJAX --> API
    API -- Trả về JSON --> Client
    Client -- Cận nhật giao diện --> JS
```

## 2. Cấu trúc Thư mục Đề xuất

```text
src/main/resources/
├── static/
│   ├── css/
│   │   ├── input.css        # Nguồn Tailwind
│   │   └── main.css         # Kết quả sau khi build
│   ├── js/
│   │   ├── utils/
│   │   │   ├── api.js       # Wrapper cho Fetch API
│   │   │   └── auth.js      # Lưu trữ JWT (localStorage)
│   │   ├── pages/
│   │   │   ├── login.js
│   │   │   ├── register.js
│   │   │   └── cart.js
│   │   └── common.js        # Các tương tác toàn cục
│   └── images/
└── templates/
    ├── layout/
    │   └── base.html        # Template chính
    ├── fragments/
    │   ├── header.html
    │   ├── footer.html
    │   └── common-head.html
    ├── customer/            # Trang phía khách hàng
    │   ├── auth/
    │   │   ├── login.html
    │   │   └── register.html
    │   ├── product/
    │   │   ├── list.html
    │   │   └── detail.html
    │   └── cart.html
    └── admin/               # Trang quản trị (mở rộng sau)
        └── dashboard.html
```

## 3. Bản đồ Ánh xạ: View vs API

| Trang / Tính năng | URL View (View Controller) | API Backend (REST) |
| :--- | :--- | :--- |
| Trang Đăng nhập | `/login` | `POST /api/auth/login` |
| Trang Đăng ký | `/register` | `POST /api/auth/register` |
| Danh sách Sản phẩm | `/products` | `GET /api/products` |
| Chi tiết Sản phẩm | `/products/{id}` | `GET /api/products/{id}` |
| Giỏ hàng | `/cart` | `GET /api/cart?userId=...` |

## 4. Ví dụ Luồng: Đăng nhập

### A. View Controller (`ViewController.java`)
```java
@Controller
public class ViewController {
    @GetMapping("/login")
    public String loginPage() {
        return "customer/auth/login";
    }
}
```

### B. Thymeleaf Template (`login.html`)
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Đăng nhập</title>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">
    <form id="loginForm" class="p-8 bg-white rounded shadow-md w-96">
        <h2 class="text-2xl font-bold mb-4">Đăng nhập</h2>
        <input type="email" id="email" placeholder="Email" required class="w-full mb-2 p-2 border">
        <input type="password" id="password" placeholder="Mật khẩu" required class="w-full mb-4 p-2 border">
        <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">Đăng nhập</button>
        <div id="errorMessage" class="text-red-500 mt-2 hidden"></div>
    </form>
    
    <!-- JS dành riêng cho trang này -->
    <script th:src="@{/js/utils/api.js}"></script>
    <script th:src="@{/js/pages/login.js}"></script>
</body>
</html>
```

### C. JavaScript - Ví dụ `api.js`
```javascript
const api = {
    async post(url, body) {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(await response.text());
        return response.json();
    }
};
```

### D. JavaScript - Ví dụ `login.js`
```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await api.post('/api/auth/login', { email, password });
        if (response.accessToken) {
            localStorage.setItem('token', response.accessToken);
            window.location.href = '/products';
        }
    } catch (err) {
        const msgDiv = document.getElementById('errorMessage');
        msgDiv.textContent = err.message;
        msgDiv.classList.remove('hidden');
    }
});
```

## 5. Bảo vệ Trang (Guard Page Flow)

Để bảo vệ các trang yêu cầu đăng nhập (ví dụ: Giỏ hàng, Hồ sơ), hãy thêm script kiểm tra token trong `<head>`:

```javascript
// common.js
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}
```

## 6. Các Best Practices (Quy tắc Tốt nhất)

1.  **Layout**: Sử dụng `th:replace` để quản lý `header.html` và `footer.html` một cách tập trung.
2.  **Logic JS**: Tuyệt đối không để logic nghiệp vụ phức tạp ở Frontend. Frontend chỉ đóng vai trò thu thập dữ liệu và gọi API.
3.  **Tailwind CSS**: Sử dụng lệnh `npm run build` để tối ưu hóa dung lượng CSS cho môi trường thực tế.
4.  **Xử lý Lỗi**: Tận dụng cấu trúc lỗi JSON từ `GlobalExceptionHandler` của Backend để hiển thị thông báo lỗi chi tiết và chuyên nghiệp trên giao diện.
