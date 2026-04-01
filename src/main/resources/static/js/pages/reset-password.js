document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const tokenInput = document.getElementById('resetToken');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            btn.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
    });

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = tokenInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!token) {
            Toast.error('Reset token is missing from the URL.');
            return;
        }

        if (newPassword.length < 8) {
            Toast.warning('Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.warning('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword, confirmPassword })
            });

            const data = await response.json();

            if (response.ok) {
                Toast.success('Password updated successfully! Please login.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                Toast.error(data.message || 'Reset failed. Token might be expired.');
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
            submitBtn.textContent = 'Updating...';
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            submitBtn.textContent = originalBtnText;
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }
});
