/**
 * Profile and Address Management for Personal Center
 */

Object.assign(PersonalCenter, {
    /**
     * State for user profile
     */
    originalProfile: null,

    /**
     * Load User Data from API and populate the UI
     */
    async loadUserData() {
        console.log('Attempting to fetch user profile from /api/users/me...');
        
        try {
            const response = await fetch('/api/users/me', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const profile = await response.json();
                this.originalProfile = profile; // Store original state for change detection
                
                // Đồng bộ hóa ngược lại AuthUtils/localStorage
                if (window.AuthUtils) {
                    const currentUser = AuthUtils.getUser() || {};
                    AuthUtils.saveUser({
                        ...currentUser,
                        userId: profile.userId,
                        fullName: profile.fullName,
                        email: profile.email,
                        role: profile.role
                    });
                    AuthUtils.updateHeaderUI();
                }

                this.populateUI(profile);
            } else {
                if (response.status === 401 || response.status === 403) {
                    if (window.AuthUtils) AuthUtils.removeUser();
                    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                } else {
                    this.fallbackToLocalStorage();
                }
            }
        } catch (error) {
            console.error('Fetch error for user profile:', error);
            this.fallbackToLocalStorage();
        }
    },

    /**
     * Populate UI elements with profile data
     */
    populateUI(profile) {
        if (!profile) return;

        const formatName = (name) => {
            if (!name) return 'User';
            return name.split(/\s+/).map(word => {
                if (!word) return "";
                return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
            }).join(' ');
        };

        const theName = formatName(profile.fullName);
        const theEmail = (profile.email || 'Not Set').toLowerCase();
        const thePhone = profile.phone || 'Not Set';

        // Update elements
        this.setElementText('pc-profile-email', theEmail);
        this.setElementText('pc-profile-phone', thePhone);
        this.setElementText('pc-manage-email', theEmail);
        this.setElementText('pc-dashboard-name', theName);
        
        // --- Cập nhật Email Verification UI ---
        const verifiedBadge = document.getElementById('pc-email-verified-badge');
        const resendBtn = document.getElementById('pc-resend-verify-btn');
        const pendingNote = document.getElementById('pc-email-pending-note');

        if (verifiedBadge) {
            // Chỉ hiện huy hiệu Verified nếu đã xác thực VÀ không đang trong quá trình đổi email mới
            const isVerified = profile.emailVerified === true;
            const hasPending = !!profile.pendingEmail;
            
            if (isVerified && !hasPending) {
                verifiedBadge.classList.remove('hidden');
            } else {
                verifiedBadge.classList.add('hidden');
            }
        }

        if (resendBtn) {
            // Hiển thị nút Verify nếu chưa xác thực HOẶC đang có email chờ đổi
            if (!profile.emailVerified || profile.pendingEmail) resendBtn.classList.remove('hidden');
            else resendBtn.classList.add('hidden');
        }

        if (pendingNote) {
            if (profile.pendingEmail) {
                pendingNote.classList.remove('hidden');
                pendingNote.innerHTML = `* A verification link has been sent to <strong>${profile.pendingEmail}</strong>. Verify to complete the change.`;
            } else {
                pendingNote.classList.add('hidden');
            }
        }
        
        // Update Address Input
        const addressInput = document.getElementById('pc-address-input');
        const dashboardAddress = document.getElementById('pc-dashboard-address');
        const currentAddressDisplay = document.getElementById('pc-current-address-display');
        const addressText = document.getElementById('pc-address-text');

        if (addressInput) {
            addressInput.value = profile.address || '';
        }
        
        if (dashboardAddress) {
            dashboardAddress.textContent = profile.address || 'No address set';
        }

        if (addressText) {
            addressText.textContent = profile.address || 'None';
            if (profile.address && currentAddressDisplay) {
                currentAddressDisplay.classList.remove('hidden');
            } else if (currentAddressDisplay) {
                currentAddressDisplay.classList.add('hidden');
            }
        }

        // Update Name Input
        const nameInput = document.getElementById('pc-profile-name-input');
        if (nameInput) {
            nameInput.value = theName;
        }
    },

    /**
     * Setup inline profile editing detection
     */
    setupProfileEditing() {
        const nameInput = document.getElementById('pc-profile-name-input');
        const saveContainer = document.getElementById('pc-save-btn-container');
        const saveBtn = document.getElementById('pc-save-profile-btn');

        if (!nameInput || !saveContainer || !saveBtn) return;

        // Detect input changes
        nameInput.addEventListener('input', () => {
            const currentValue = nameInput.value.trim();
            const originalValue = (this.originalProfile && this.originalProfile.fullName) || '';

            if (currentValue !== originalValue && currentValue.length >= 2) {
                saveContainer.classList.remove('hidden');
                saveContainer.classList.add('animate-in', 'fade-in', 'slide-in-from-top-2');
            } else {
                saveContainer.classList.add('hidden');
            }
        });

        // Handle save action
        saveBtn.addEventListener('click', () => this.saveProfile());
    },

    /**
     * Save profile changes to database
     */
    async saveProfile() {
        const nameInput = document.getElementById('pc-profile-name-input');
        if (!nameInput) return;

        const newName = nameInput.value.trim();
        if (newName.length < 2) {
            if (window.Toast) Toast.error('Họ tên phải có ít nhất 2 ký tự');
            return;
        }

        const saveBtn = document.getElementById('pc-save-profile-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[16px]">sync</span> Saving...`;

        try {
            // Chuẩn bị DTO (Giữ nguyên phone và address hiện tại)
            const updateData = {
                fullName: newName,
                phone: this.originalProfile ? this.originalProfile.phone : '',
                email: this.originalProfile ? this.originalProfile.email : '',
                address: this.originalProfile ? this.originalProfile.address : ''
            };

            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                this.originalProfile = updatedProfile;
                
                if (window.Toast) Toast.success('Cập nhật hồ sơ thành công!');

                // Hiệu ứng nút thành công
                saveBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">check_circle</span> Updated!`;
                saveBtn.classList.remove('bg-secondary');
                saveBtn.classList.add('bg-green-600');
                
                // Cập nhật lại UI
                this.populateUI(updatedProfile);
                
                // Đồng bộ Header
                if (window.AuthUtils) {
                    const user = AuthUtils.getUser();
                    AuthUtils.saveUser({ ...user, fullName: updatedProfile.fullName });
                    AuthUtils.updateHeaderUI();
                }

                // Ẩn bảng lưu sau 1.5s
                setTimeout(() => {
                    const container = document.getElementById('pc-save-btn-container');
                    if (container) container.classList.add('hidden');
                    // Reset button state for next time
                    saveBtn.innerHTML = originalText;
                    saveBtn.classList.add('bg-secondary');
                    saveBtn.classList.remove('bg-green-600');
                }, 1500);
            } else {
                const err = await response.json();
                throw new Error(err.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            if (window.Toast) Toast.error(error.message || 'Lỗi kết nối máy chủ!');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    /**
     * Setup address editing detection
     */
    setupAddressEditing() {
        const addressInput = document.getElementById('pc-address-input');
        const saveContainer = document.getElementById('pc-save-address-container');
        const saveBtn = document.getElementById('pc-save-address-btn');

        if (!addressInput || !saveContainer || !saveBtn) return;

        addressInput.addEventListener('input', () => {
            const currentValue = addressInput.value.trim();
            const originalValue = (this.originalProfile && this.originalProfile.address) || '';

            if (currentValue !== originalValue) {
                saveContainer.classList.remove('hidden');
                saveContainer.classList.add('animate-in', 'fade-in', 'slide-in-from-top-2');
            } else {
                saveContainer.classList.add('hidden');
            }
        });

        saveBtn.addEventListener('click', () => this.saveAddress());
    },

    /**
     * Save address changes to database
     */
    async saveAddress() {
        const addressInput = document.getElementById('pc-address-input');
        if (!addressInput) return;

        const newAddress = addressInput.value.trim();
        const saveBtn = document.getElementById('pc-save-address-btn');
        const originalText = saveBtn.innerHTML;
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[16px]">sync</span> Saving...`;

        try {
            const updateData = {
                fullName: this.originalProfile ? this.originalProfile.fullName : '',
                phone: this.originalProfile ? this.originalProfile.phone : '',
                email: this.originalProfile ? this.originalProfile.email : '',
                address: newAddress
            };

            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                this.originalProfile = updatedProfile;
                
                if (window.Toast) Toast.success('Cập nhật địa chỉ thành công!');

                // Hiệu ứng nút thành công
                saveBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">check_circle</span> Address Saved!`;
                saveBtn.classList.remove('bg-secondary');
                saveBtn.classList.add('bg-green-600');
                
                // Cập nhật lại UI để đồng bộ dữ liệu
                this.populateUI(updatedProfile);

                // Ẩn bảng lưu sau 1.5s
                setTimeout(() => {
                    const container = document.getElementById('pc-save-address-container');
                    if (container) container.classList.add('hidden');
                    // Reset button state
                    saveBtn.innerHTML = originalText;
                    saveBtn.classList.add('bg-secondary');
                    saveBtn.classList.remove('bg-green-600');
                }, 1500);
            } else {
                const err = await response.json();
                throw new Error(err.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Save address error:', error);
            if (window.Toast) Toast.error(error.message || 'Lỗi kết nối máy chủ!');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    /**
     * Fallback to local storage if API is unreachable
     */
    fallbackToLocalStorage() {
        if (window.AuthUtils) {
            const user = AuthUtils.getUser();
            if (user) {
                console.log('Falling back to localStorage data');
                this.populateUI({
                    fullName: user.fullName,
                    email: user.email,
                    phone: 'Not Set', // localStorage usually doesn't have phone/address
                    address: null
                });
            }
        }
    }
});
