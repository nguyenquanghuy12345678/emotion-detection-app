/**
 * AuthView - Quản lý giao diện xác thực
 */
export class AuthView {
    constructor() {
        this.authModal = null;
        this.loginForm = null;
        this.registerForm = null;
        this.guestModeBar = null;
        this.userInfoBar = null;
        
        this.init();
    }

    init() {
        this.authModal = document.getElementById('authModal');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.guestModeBar = document.getElementById('guestModeBar');
        this.userInfoBar = document.getElementById('userInfoBar');
    }

    /**
     * Hiển thị modal xác thực
     */
    showModal() {
        if (this.authModal) {
            this.authModal.style.display = 'block';
            this.showLoginForm();
        }
    }

    /**
     * Ẩn modal xác thực
     */
    hideModal() {
        if (this.authModal) {
            this.authModal.style.display = 'none';
        }
    }

    /**
     * Hiển thị form đăng nhập
     */
    showLoginForm() {
        if (this.loginForm && this.registerForm) {
            this.loginForm.style.display = 'block';
            this.registerForm.style.display = 'none';
        }
    }

    /**
     * Hiển thị form đăng ký
     */
    showRegisterForm() {
        if (this.loginForm && this.registerForm) {
            this.loginForm.style.display = 'none';
            this.registerForm.style.display = 'block';
        }
    }

    /**
     * Hiển thị Guest Mode Bar
     */
    showGuestMode() {
        if (this.guestModeBar && this.userInfoBar) {
            this.guestModeBar.style.display = 'flex';
            this.userInfoBar.style.display = 'none';
            console.log('👻 Guest mode displayed');
        }
    }

    /**
     * Hiển thị User Info Bar
     */
    showUserInfo(user) {
        if (this.guestModeBar && this.userInfoBar) {
            this.guestModeBar.style.display = 'none';
            this.userInfoBar.style.display = 'flex';
            
            // Update user info
            const userNameEl = document.getElementById('userName');
            const userEmailEl = document.getElementById('userEmail');
            
            if (userNameEl) {
                userNameEl.textContent = user.getDisplayName();
            }
            if (userEmailEl) {
                userEmailEl.textContent = user.email;
            }
            
            console.log('✅ User info displayed:', user.email);
        }
    }

    /**
     * Lấy dữ liệu form đăng nhập
     */
    getLoginData() {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;
        return { email, password };
    }

    /**
     * Lấy dữ liệu form đăng ký
     */
    getRegisterData() {
        const fullName = document.getElementById('registerFullName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        return { fullName, email, password };
    }

    /**
     * Hiển thị lỗi
     */
    showError(message, isRegister = false) {
        const errorEl = isRegister 
            ? document.getElementById('registerError')
            : document.getElementById('loginError');
            
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Hiển thị success message
     */
    showSuccess(message) {
        // Có thể implement toast notification
        console.log('✅', message);
    }

    /**
     * Reset forms
     */
    resetForms() {
        const loginEmailEl = document.getElementById('loginEmail');
        const loginPasswordEl = document.getElementById('loginPassword');
        const registerFullNameEl = document.getElementById('registerFullName');
        const registerEmailEl = document.getElementById('registerEmail');
        const registerPasswordEl = document.getElementById('registerPassword');
        
        if (loginEmailEl) loginEmailEl.value = '';
        if (loginPasswordEl) loginPasswordEl.value = '';
        if (registerFullNameEl) registerFullNameEl.value = '';
        if (registerEmailEl) registerEmailEl.value = '';
        if (registerPasswordEl) registerPasswordEl.value = '';
    }
}
