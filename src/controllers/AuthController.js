/**
 * AuthController - Điều khiển xác thực
 */
import { APIService } from '../services/APIService.js';
import { AuthView } from '../views/AuthView.js';

export class AuthController {
    constructor() {
        this.apiService = new APIService();
        this.view = new AuthView();
        this.currentUser = null;
        
        this.init();
    }

    init() {
        // Load user từ localStorage
        this.currentUser = this.apiService.getCurrentUser();
        
        // Setup UI
        if (this.currentUser) {
            this.view.showUserInfo(this.currentUser);
        } else {
            this.view.showGuestMode();
        }

        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        // Login form
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        // Register form
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.handleRegister());
        }

        // Switch forms
        const switchToRegisterBtn = document.getElementById('switchToRegister');
        if (switchToRegisterBtn) {
            switchToRegisterBtn.addEventListener('click', () => {
                this.view.showRegisterForm();
            });
        }

        const switchToLoginBtn = document.getElementById('switchToLogin');
        if (switchToLoginBtn) {
            switchToLoginBtn.addEventListener('click', () => {
                this.view.showLoginForm();
            });
        }

        // Close modal
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.view.hideModal();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Show modal from guest bar
        const guestLoginBtn = document.getElementById('guestLoginBtn');
        if (guestLoginBtn) {
            guestLoginBtn.addEventListener('click', () => {
                this.view.showModal();
            });
        }
    }

    /**
     * Xử lý đăng nhập
     */
    async handleLogin() {
        const { email, password } = this.view.getLoginData();

        if (!email || !password) {
            this.view.showError('Vui lòng nhập email và password!');
            return;
        }

        try {
            const user = await this.apiService.login(email, password);
            this.currentUser = user;
            
            this.view.hideModal();
            this.view.showUserInfo(user);
            this.view.showSuccess('Đăng nhập thành công!');
            this.view.resetForms();

            // Trigger app reload
            window.location.reload();
        } catch (error) {
            this.view.showError(error.message || 'Đăng nhập thất bại!');
        }
    }

    /**
     * Xử lý đăng ký
     */
    async handleRegister() {
        const { fullName, email, password } = this.view.getRegisterData();

        if (!fullName || !email || !password) {
            this.view.showError('Vui lòng điền đầy đủ thông tin!', true);
            return;
        }

        if (password.length < 6) {
            this.view.showError('Mật khẩu phải có ít nhất 6 ký tự!', true);
            return;
        }

        try {
            const user = await this.apiService.register(email, password, fullName);
            this.currentUser = user;
            
            this.view.hideModal();
            this.view.showUserInfo(user);
            this.view.showSuccess('Đăng ký thành công!');
            this.view.resetForms();

            // Trigger app reload
            window.location.reload();
        } catch (error) {
            this.view.showError(error.message || 'Đăng ký thất bại!', true);
        }
    }

    /**
     * Xử lý đăng xuất
     */
    handleLogout() {
        this.apiService.logout();
        this.currentUser = null;
        this.view.showGuestMode();
        this.view.showSuccess('Đã đăng xuất!');
        
        // Reload app
        window.location.reload();
    }

    /**
     * Lấy user hiện tại
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isAuthenticated() {
        return this.apiService.isAuthenticated();
    }
}
