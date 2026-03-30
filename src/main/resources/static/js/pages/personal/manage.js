/**
 * Account Management for Personal Center
 * Handles Email, Password, 2FA, and Deletion
 */

Object.assign(PersonalCenter, {
    /**
     * Initialize Manage Account listeners
     */
    setupManageAccount() {
        console.log('Setting up tab-manage listeners...');

        // --- Email Change ---
        const changeEmailToggle = document.getElementById('pc-change-email-toggle');
        const emailEditContainer = document.getElementById('pc-email-edit-container');
        const cancelEmailBtn = document.getElementById('pc-cancel-email-btn');
        const saveEmailBtn = document.getElementById('pc-save-email-btn');

        if (changeEmailToggle) {
            changeEmailToggle.addEventListener('click', () => {
                emailEditContainer.classList.toggle('hidden');
                changeEmailToggle.textContent = emailEditContainer.classList.contains('hidden') ? 'Change' : 'Close';
            });
        }

        if (cancelEmailBtn) {
            cancelEmailBtn.addEventListener('click', () => {
                emailEditContainer.classList.add('hidden');
                changeEmailToggle.textContent = 'Change';
            });
        }

        if (saveEmailBtn) {
            saveEmailBtn.addEventListener('click', () => this.updateEmail());
        }

        // --- Password Change ---
        const changePasswordToggle = document.getElementById('pc-change-password-toggle');
        const passwordEditContainer = document.getElementById('pc-password-edit-container');
        const cancelPasswordBtn = document.getElementById('pc-cancel-password-btn');
        const savePasswordBtn = document.getElementById('pc-save-password-btn');

        if (changePasswordToggle) {
            changePasswordToggle.addEventListener('click', () => {
                passwordEditContainer.classList.toggle('hidden');
                changePasswordToggle.textContent = passwordEditContainer.classList.contains('hidden') ? 'Update' : 'Close';
            });
        }

        if (cancelPasswordBtn) {
            cancelPasswordBtn.addEventListener('click', () => {
                passwordEditContainer.classList.add('hidden');
                changePasswordToggle.textContent = 'Update';
            });
        }

        if (savePasswordBtn) {
            console.log('Attaching click listener to save password button');
            savePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Save Password button clicked!');
                this.updatePassword();
            });
        } else {
            console.warn('Could not find pc-save-password-btn in DOM');
        }



        // --- Password Toggles ---
        this.setupPasswordToggles();

        // --- Delete Account ---
        const deleteBtn = document.getElementById('pc-delete-account-btn');
        if (deleteBtn) {
            console.log('Attaching click listener to delete button');
            deleteBtn.addEventListener('click', () => this.confirmDeleteAccount());
        }

        // --- Resend Verification ---
        const resendBtn = document.getElementById('pc-resend-verify-btn');
        if (resendBtn) {
            resendBtn.addEventListener('click', () => this.resendVerification());
        }

    },

    /**
     * Update Email Address
     */
    async updateEmail() {
        const emailInput = document.getElementById('pc-new-email-input');
        const newEmail = emailInput.value.trim();

        if (!newEmail || !newEmail.includes('@')) {
            if (window.Toast) Toast.error('Vui lòng nhập email hợp lệ!');
            return;
        }

        const saveBtn = document.getElementById('pc-save-email-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[12px]">sync</span> Updating...';

        try {
            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: this.originalProfile.fullName,
                    phone: this.originalProfile.phone,
                    address: this.originalProfile.address,
                    email: newEmail
                })
            });

            if (response.ok) {
                if (window.Toast) Toast.success('Yêu cầu đổi email đã được ghi nhận. Vui lòng kiểm tra email mới để xác thực!');
                
                // Cập nhật UI tạm thời
                document.getElementById('pc-email-edit-container').classList.add('hidden');
                document.getElementById('pc-change-email-toggle').textContent = 'Change';
                
                // Ẩn badge Verified ngay lập tức
                const verifiedBadge = document.getElementById('pc-email-verified-badge');
                if (verifiedBadge) verifiedBadge.classList.add('hidden');

                const pendingNote = document.getElementById('pc-email-pending-note');
                if (pendingNote) {
                    pendingNote.classList.remove('hidden');
                    pendingNote.classList.remove('text-blue-500');
                    pendingNote.classList.add('text-emerald-600');
                }
                
                document.getElementById('pc-resend-verify-btn').classList.remove('hidden');
            } else {
                const err = await response.json();
                throw new Error(err.message || 'Lỗi cập nhật email');
            }
        } catch (error) {
            console.error('Email update error:', error);
            if (window.Toast) Toast.error(error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Save Email';
        }
    },

    /**
     * Resend Verification Email
     */
    async resendVerification() {
        const resendBtn = document.getElementById('pc-resend-verify-btn');
        resendBtn.disabled = true;
        const originalText = resendBtn.textContent;
        resendBtn.textContent = 'Sending...';

        try {
            const response = await fetch('/api/users/me/resend-verification', {
                method: 'POST'
            });

            if (response.ok) {
                if (window.Toast) Toast.success('Đã gửi lại email xác thực!');
            } else {
                const err = await response.json();
                throw new Error(err.message || 'Lỗi khi gửi lại email');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            if (window.Toast) Toast.error(error.message);
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = originalText;
        }
    },

    /**
     * Update Password
     */
    async updatePassword() {
        console.log('--- Bắt đầu quy trình đổi mật khẩu ---');
        const currentPass = document.getElementById('pc-current-password').value;
        const newPass = document.getElementById('pc-new-password').value;
        const confirmPass = document.getElementById('pc-confirm-password').value;

        console.log('Dữ liệu nhập vào:', {
            hasCurrent: !!currentPass,
            newLen: newPass ? newPass.length : 0,
            match: newPass === confirmPass
        });

        if (!currentPass || !newPass || newPass.length < 6) {
            console.warn('Validation failed: Thiếu thông tin hoặc mật khẩu mới dưới 6 ký tự');
            const msg = !currentPass ? 'Vui lòng nhập mật khẩu hiện tại!' : 'Mật khẩu mới phải từ 6-128 ký tự!';
            if (window.Toast) Toast.error(msg);
            else alert(msg);
            return;
        }

        if (newPass !== confirmPass) {
            console.warn('Validation failed: Mật khẩu xác nhận không khớp');
            if (window.Toast) Toast.error('Mật khẩu xác nhận không khớp!');
            else alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        const saveBtn = document.getElementById('pc-save-password-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[14px]">sync</span> Saving...';

        console.log('Đang gửi request PUT tới /api/users/me/password...');

        try {
            const response = await fetch('/api/users/me/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: currentPass,
                    newPassword: newPass,
                    confirmNewPassword: confirmPass
                })
            });

            console.log('Server response status:', response.status);

            if (response.ok) {
                console.log('Đổi mật khẩu thành công!');
                // Hiển thị Success Modal cao cấp
                this.showSuccessModal();

                // Ẩn bảng nhập sau 2.5s (khớp với thời gian modal hiển thị)
                setTimeout(() => {
                    document.getElementById('pc-password-edit-container').classList.add('hidden');
                    document.getElementById('pc-change-password-toggle').textContent = 'Update';
                }, 2500);

                // Clear inputs
                document.getElementById('pc-current-password').value = '';
                document.getElementById('pc-new-password').value = '';
                document.getElementById('pc-confirm-password').value = '';
            } else {
                const err = await response.json();
                console.error('Server error details:', err);
                throw new Error(err.message || 'Lỗi server khi đổi mật khẩu');
            }
        } catch (error) {
            console.error('Password change error (Catch):', error);
            if (window.Toast) Toast.error(error.message);
            else alert('Lỗi: ' + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },



    /**
     * Confirm and Delete Account
     */
    confirmDeleteAccount() {
        const confirmed = confirm('CẢNH BÁO: Hành động này sẽ khóa tài khoản của bạn vĩnh viễn và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?');
        if (!confirmed) return;

        const doubleConfirmed = prompt('Vui lòng nhập "CONFIRM" để xác nhận việc xóa tài khoản:');
        if (doubleConfirmed !== 'CONFIRM') {
            if (window.Toast) Toast.warning('Xác nhận không khớp, hành động đã bị hủy.');
            return;
        }

        this.executeDeleteAccount();
    },

    async executeDeleteAccount() {
        try {
            const response = await fetch('/api/users/me', {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Tài khoản của bạn đã được đóng. Hẹn gặp lại!');
                if (window.AuthUtils) AuthUtils.logout();
            } else {
                const err = await response.json();
                if (window.Toast) Toast.error(err.message || 'Lỗi khi xóa tài khoản!');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            if (window.Toast) Toast.error('Lỗi kết nối máy chủ!');
        }
    },


    /**
     * Logic for toggling password visibility
     */
    setupPasswordToggles() {
        const toggles = document.querySelectorAll('.password-toggle');
        toggles.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.previousElementSibling;
                const icon = btn.querySelector('.material-symbols-outlined');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.textContent = 'visibility_off';
                } else {
                    input.type = 'password';
                    icon.textContent = 'visibility';
                }
            });
        });
    },

    /**
     * Show premium Success Modal
     */
    showSuccessModal() {
        const modal = document.getElementById('pc-password-success-modal');
        if (!modal) return;

        const backdrop = modal.querySelector('.bg-backdrop');
        const content = modal.querySelector('.bg-modal');

        // Show modal container
        modal.classList.remove('hidden');

        // Trigger animations
        setTimeout(() => {
            backdrop.classList.add('show');
            content.classList.add('show');
        }, 10);

        // Auto hide after 2.5s
        setTimeout(() => {
            backdrop.classList.remove('show');
            content.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 500);
        }, 2500);
    }
});
