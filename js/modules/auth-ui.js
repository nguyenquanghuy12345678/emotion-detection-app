/**
 * Authentication UI Module
 * Quản lý giao diện đăng nhập/đăng ký
 */

export class AuthUI {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.init();
    }

    init() {
        console.log('🔐 Initializing Authentication UI...');
        
        // Check current user
        const user = this.apiClient ? this.apiClient.getCurrentUser() : null;
        
        if (user) {
            this.showUserInfo(user);
        } else {
            this.showGuestMode();
        }

        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        // Show modal
        const guestLoginBtn = document.getElementById('guestLoginBtn');
        if (guestLoginBtn) {
            guestLoginBtn.addEventListener('click', () => this.showAuthModal());
        }

        // Login
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        // Register
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.handleRegister());
        }

        // Switch forms
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToRegister();
        });

        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToLogin();
        });

        // Close modal
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            this.closeAuthModal();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('authModal');
            if (e.target === modal) {
                this.closeAuthModal();
            }
        });
    }

    showGuestMode() {
        document.getElementById('userInfoBar').style.display = 'none';
        document.getElementById('guestModeBar').style.display = 'flex';
        console.log('👻 Guest mode displayed');
    }

    showUserInfo(user) {
        document.getElementById('guestModeBar').style.display = 'none';
        document.getElementById('userInfoBar').style.display = 'flex';
        document.getElementById('userDisplayName').textContent = user.full_name || user.fullName || 'User';
        document.getElementById('userDisplayEmail').textContent = user.email;
        console.log('✅ User info displayed:', user.email);
    }

    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
        this.switchToLogin(); // Default to login form
    }

    closeAuthModal() {
        document.getElementById('authModal').style.display = 'none';
        this.clearErrors();
    }

    switchToRegister() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        this.clearErrors();
    }

    switchToLogin() {
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        this.clearErrors();
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('Vui lòng nhập email và mật khẩu!', 'login');
            return;
        }

        try {
            const result = await this.apiClient.login(email, password);
            this.showUserInfo(result.user);
            this.closeAuthModal();
            this.clearForms();
            
            // Reload to update app state
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            this.showError(error.message || 'Đăng nhập thất bại!', 'login');
        }
    }

    async handleRegister() {
        const fullName = document.getElementById('registerFullName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        if (!fullName || !email || !password) {
            this.showError('Vui lòng điền đầy đủ thông tin!', 'register');
            return;
        }

        if (password.length < 6) {
            this.showError('Mật khẩu phải có ít nhất 6 ký tự!', 'register');
            return;
        }

        try {
            const result = await this.apiClient.register(email, password, fullName);
            this.showUserInfo(result.user);
            this.closeAuthModal();
            this.clearForms();
            
            // Reload to update app state
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            this.showError(error.message || 'Đăng ký thất bại!', 'register');
        }
    }

    handleLogout() {
        this.apiClient.logout();
        this.showGuestMode();
        window.location.reload();
    }

    showError(message, form) {
        const errorEl = document.getElementById(form === 'register' ? 'registerError' : 'loginError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }

    clearErrors() {
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('registerError').style.display = 'none';
    }

    clearForms() {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('registerFullName').value = '';
        document.getElementById('registerEmail').value = '';
        document.getElementById('registerPassword').value = '';
    }
}

// Make it globally accessible
window.AuthUI = AuthUI;
