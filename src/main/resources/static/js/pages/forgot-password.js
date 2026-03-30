document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) {
            Toast.warning('Please enter your email address.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                Toast.success('Recovery link sent! Please check your email.');
                emailInput.value = '';
                // Optional: redirect to login after a delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                Toast.error(data.message || 'Something went wrong. Please try again.');
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
            submitBtn.textContent = 'Sending...';
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            submitBtn.textContent = originalBtnText;
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }
});
