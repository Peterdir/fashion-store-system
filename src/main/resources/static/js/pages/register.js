document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // Password visibility toggle logic
    const setupToggle = (inputId, btnId) => {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if (!input || !btn) return;
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
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Client-side validation
        if (!data.fullName || !data.phone || !data.email || !data.password || !data.confirmPassword) {
            Toast.warning('Please fill in all required fields.');
            return;
        }

        if (data.password !== data.confirmPassword) {
            Toast.error('Passwords do not match. Please try again.');
            return;
        }

        if (data.password.length < 8) {
            Toast.warning('Password must be at least 8 characters long.');
            return;
        }

        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            Toast.warning('Please agree to the Terms of Service.');
            return;
        }

        // Loading state
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                const email = document.getElementById('email').value;
                Toast.success('Registration successful! Please check your email.');
                
                // Redirect to auth-notice instead of /login
                setTimeout(() => {
                    window.location.href = `/auth-notice?email=${encodeURIComponent(email)}&type=verify-email`;
                }, 1500);
            } else {
                const errorMsg = extractErrorMessage(result);
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
            submitBtn.textContent = 'Creating Account...';
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
        return 'Registration failed. Please try again.';
    }
});
