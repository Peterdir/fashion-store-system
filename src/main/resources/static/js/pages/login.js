document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleIcon = togglePasswordBtn.querySelector('.material-symbols-outlined');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // Password visibility toggle
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleIcon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });

    // --- REMEMBER ME AUTO-FILL ---
    const REMEMBER_KEY = 'hy_remembered_email';
    const emailInput = document.getElementById('email');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Load remembered email on startup
    const savedEmail = localStorage.getItem(REMEMBER_KEY);
    if (savedEmail && emailInput && rememberMeCheckbox) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Client-side validation
        if (!email || !password) {
            Toast.warning('Please fill in all required fields.');
            return;
        }

        // Loading state
        setLoading(true);

        try {
            const response = await fetch('/api/auth/cookie/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe })
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu thông tin user vào localStorage (token đã được set vào Cookie bởi Server)
                AuthUtils.saveUser({
                    userId: data.userId,
                    fullName: data.fullName,
                    email: data.email,
                    role: data.role
                });

                // Xử lý Remember Me: Lưu hoặc xóa email đã nhớ
                if (rememberMe) {
                    localStorage.setItem(REMEMBER_KEY, email);
                } else {
                    localStorage.removeItem(REMEMBER_KEY);
                }

                Toast.success(`Welcome back, ${data.fullName}!`);

                // Chuyển hướng theo role: ADMIN → admin dashboard, CUSTOMER → trang chủ
                const redirectUrl = data.role === 'ADMIN' ? '/admin/dashboard' : '/';
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                // Xử lý lỗi từ Server
                const errorMsg = extractErrorMessage(data);
                Toast.error(errorMsg);
                setLoading(false);
            }
        } catch (error) {
            Toast.error('Unable to connect to server. Please try again later.');
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            submitBtn.textContent = 'Signing in...';
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            submitBtn.textContent = originalBtnText;
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }

    function extractErrorMessage(data) {
        if (typeof data === 'string') return data;
        if (data.message) return data.message;
        if (data.error) return data.error;
        if (data.errors && Array.isArray(data.errors)) return data.errors.join(', ');
        return 'Login failed. Please check your credentials.';
    }
});
