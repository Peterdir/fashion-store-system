/**
 * Auth Notice Logic
 * Handles Resend Verification Email functionality and countdown timer.
 */
document.addEventListener('DOMContentLoaded', () => {
    const resendBtn = document.getElementById('resendBtn');
    const userEmail = document.getElementById('userEmail').value;
    const countdownMsg = document.getElementById('countdownMsg');
    const timerSpan = document.getElementById('timer');

    let countdown = 0;
    let timerId = null;

    if (!resendBtn || !userEmail) return;

    resendBtn.addEventListener('click', async () => {
        if (countdown > 0) return;

        setLoading(true);

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });

            const data = await response.json();

            if (response.ok) {
                Toast.success('Verification email sent successfully!');
                startCountdown(60);
            } else {
                Toast.error(data.message || 'Failed to resend email.');
            }
        } catch (error) {
            console.error('Resend error:', error);
            Toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    });

    function startCountdown(seconds) {
        countdown = seconds;
        resendBtn.disabled = true;
        countdownMsg.classList.remove('hidden');
        updateTimerDisplay();

        timerId = setInterval(() => {
            countdown--;
            updateTimerDisplay();

            if (countdown <= 0) {
                clearInterval(timerId);
                resendBtn.disabled = false;
                countdownMsg.classList.add('hidden');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        timerSpan.textContent = countdown;
    }

    function setLoading(isLoading) {
        if (isLoading) {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
        } else {
            resendBtn.disabled = countdown > 0;
            resendBtn.textContent = 'Resend Verification Email';
        }
    }
});
