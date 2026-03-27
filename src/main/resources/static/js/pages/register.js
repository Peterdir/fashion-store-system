document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    // Password visibility toggle logic
    const setupToggle = (inputId, btnId) => {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        const icon = btn.querySelector('.material-symbols-outlined');

        btn.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    };

    setupToggle('password', 'togglePassword');
    setupToggle('confirmPassword', 'toggleConfirmPassword');

    // Form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Basic client-side validation for password match
        if (data.password !== data.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        console.log('Registration attempt:', data);
        // Add your API call logic here: POST /api/auth/register
    });
});
