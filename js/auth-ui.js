// ============================================
// AUTHENTICATION UI COMPONENT
// Login/Register modals and user management
// ============================================

class AuthUI {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is logged in
        if (window.apiClient && window.apiClient.isAuthenticated()) {
            this.isAuthenticated = true;
            this.currentUser = window.apiClient.getCurrentUser();
            this.showAuthenticatedUI();
        } else {
            this.showLoginModal();
        }

        // Create auth UI elements
        this.createAuthModals();
        this.createUserMenu();
    }

    // ============================================
    // CREATE UI ELEMENTS
    // ============================================

    createAuthModals() {
        // Check if modals already exist
        if (document.getElementById('authModal')) return;

        const modalHTML = `
            <!-- Auth Modal -->
            <div id="authModal" class="auth-modal" style="display: none;">
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2 id="authModalTitle">🎭 Đăng Nhập</h2>
                    </div>
                    
                    <div class="auth-modal-body">
                        <!-- Login Form -->
                        <div id="loginForm" class="auth-form">
                            <div class="form-group">
                                <label for="loginEmail">📧 Email</label>
                                <input type="email" id="loginEmail" placeholder="email@example.com" required />
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">🔒 Mật khẩu</label>
                                <input type="password" id="loginPassword" placeholder="Nhập mật khẩu" required />
                            </div>
                            <div id="loginError" class="error-message"></div>
                            <button onclick="authUI.login()" class="btn-primary btn-block">
                                🚀 Đăng Nhập
                            </button>
                            <p class="auth-switch">
                                Chưa có tài khoản? 
                                <a href="#" onclick="authUI.switchToRegister(); return false;">Đăng ký ngay</a>
                            </p>
                        </div>

                        <!-- Register Form -->
                        <div id="registerForm" class="auth-form" style="display: none;">
                            <div class="form-group">
                                <label for="registerName">👤 Họ tên</label>
                                <input type="text" id="registerName" placeholder="Nguyễn Văn A" />
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">📧 Email</label>
                                <input type="email" id="registerEmail" placeholder="email@example.com" required />
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">🔒 Mật khẩu</label>
                                <input type="password" id="registerPassword" placeholder="Tối thiểu 6 ký tự" required />
                            </div>
                            <div class="form-group">
                                <label for="registerPasswordConfirm">🔒 Xác nhận mật khẩu</label>
                                <input type="password" id="registerPasswordConfirm" placeholder="Nhập lại mật khẩu" required />
                            </div>
                            <div id="registerError" class="error-message"></div>
                            <button onclick="authUI.register()" class="btn-primary btn-block">
                                ✨ Tạo Tài Khoản
                            </button>
                            <p class="auth-switch">
                                Đã có tài khoản? 
                                <a href="#" onclick="authUI.switchToLogin(); return false;">Đăng nhập</a>
                            </p>
                        </div>
                    </div>

                    <div class="auth-modal-footer">
                        <p class="demo-info">
                            💡 <strong>Demo account:</strong> demo@emotiontracker.com / demo123
                        </p>
                    </div>
                </div>
            </div>

            <style>
                .auth-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    animation: fadeIn 0.3s ease-out;
                }

                .auth-modal-content {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 450px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease-out;
                }

                .auth-modal-header h2 {
                    margin: 0 0 20px 0;
                    color: #333;
                    text-align: center;
                }

                .auth-form {
                    margin: 20px 0;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    color: #555;
                    font-weight: 600;
                    font-size: 14px;
                }

                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                    box-sizing: border-box;
                }

                .form-group input:focus {
                    outline: none;
                    border-color: #4CAF50;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 14px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                }

                .btn-block {
                    width: 100%;
                }

                .auth-switch {
                    text-align: center;
                    margin-top: 15px;
                    color: #666;
                    font-size: 14px;
                }

                .auth-switch a {
                    color: #4CAF50;
                    text-decoration: none;
                    font-weight: 600;
                }

                .auth-switch a:hover {
                    text-decoration: underline;
                }

                .error-message {
                    background: #fee;
                    border: 1px solid #fcc;
                    color: #c00;
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    font-size: 14px;
                    display: none;
                }

                .error-message.show {
                    display: block;
                }

                .demo-info {
                    text-align: center;
                    color: #888;
                    font-size: 12px;
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                }

                .user-menu {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 10px 20px;
                    border-radius: 25px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1000;
                }

                .user-menu .user-name {
                    font-weight: 600;
                    color: #333;
                }

                .user-menu .user-email {
                    font-size: 12px;
                    color: #888;
                }

                .user-menu button {
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 15px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: background 0.3s;
                }

                .user-menu button:hover {
                    background: #d32f2f;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add Enter key listeners
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');
        
        if (loginEmail) {
            loginPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.login();
            });
        }

        const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
        if (registerPasswordConfirm) {
            registerPasswordConfirm.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.register();
            });
        }
    }

    createUserMenu() {
        // Remove existing menu
        const existing = document.getElementById('userMenu');
        if (existing) existing.remove();

        if (!this.isAuthenticated || !this.currentUser) return;

        const menuHTML = `
            <div id="userMenu" class="user-menu">
                <div>
                    <div class="user-name">👤 ${this.currentUser.fullName || this.currentUser.full_name || 'User'}</div>
                    <div class="user-email">${this.currentUser.email}</div>
                </div>
                <button onclick="authUI.logout()">🚪 Đăng xuất</button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', menuHTML);
    }

    // ============================================
    // MODAL CONTROLS
    // ============================================

    showLoginModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
            this.switchToLogin();
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    switchToLogin() {
        document.getElementById('authModalTitle').textContent = '🎭 Đăng Nhập';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        this.clearErrors();
    }

    switchToRegister() {
        document.getElementById('authModalTitle').textContent = '✨ Đăng Ký';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        this.clearErrors();
    }

    clearErrors() {
        const loginError = document.getElementById('loginError');
        const registerError = document.getElementById('registerError');
        
        if (loginError) {
            loginError.textContent = '';
            loginError.classList.remove('show');
        }
        if (registerError) {
            registerError.textContent = '';
            registerError.classList.remove('show');
        }
    }

    showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    // ============================================
    // AUTHENTICATION ACTIONS
    // ============================================

    async login() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('loginError', '⚠️ Vui lòng nhập email và mật khẩu');
            return;
        }

        try {
            // Show loading
            const loginBtn = event.target;
            loginBtn.disabled = true;
            loginBtn.textContent = '⏳ Đang đăng nhập...';

            const result = await window.apiClient.login(email, password);

            console.log('✅ Login successful:', result);

            this.isAuthenticated = true;
            this.currentUser = result.user;

            // Hide modal
            this.hideLoginModal();

            // Show user menu
            this.createUserMenu();

            // Show success message
            this.showNotification('✅ Đăng nhập thành công!', 'success');

            // Start auto-sync
            window.apiClient.startAutoSync(5);

            // Load user data from server
            await this.loadUserData();

        } catch (error) {
            console.error('Login error:', error);
            this.showError('loginError', '❌ ' + error.message);
            
            // Reset button
            const loginBtn = event.target;
            loginBtn.disabled = false;
            loginBtn.textContent = '🚀 Đăng Nhập';
        }
    }

    async register() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        // Validation
        if (!email || !password) {
            this.showError('registerError', '⚠️ Vui lòng nhập email và mật khẩu');
            return;
        }

        if (password.length < 6) {
            this.showError('registerError', '⚠️ Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('registerError', '⚠️ Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            // Show loading
            const registerBtn = event.target;
            registerBtn.disabled = true;
            registerBtn.textContent = '⏳ Đang tạo tài khoản...';

            const result = await window.apiClient.register(email, password, name);

            console.log('✅ Registration successful:', result);

            this.isAuthenticated = true;
            this.currentUser = result.user;

            // Hide modal
            this.hideLoginModal();

            // Show user menu
            this.createUserMenu();

            // Show success message
            this.showNotification('🎉 Đăng ký thành công! Chào mừng bạn!', 'success');

            // Start auto-sync
            window.apiClient.startAutoSync(5);

        } catch (error) {
            console.error('Register error:', error);
            this.showError('registerError', '❌ ' + error.message);
            
            // Reset button
            const registerBtn = event.target;
            registerBtn.disabled = false;
            registerBtn.textContent = '✨ Tạo Tài Khoản';
        }
    }

    logout() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            window.apiClient.logout();
            this.isAuthenticated = false;
            this.currentUser = null;
            
            // Remove user menu
            const menu = document.getElementById('userMenu');
            if (menu) menu.remove();

            // Show login modal
            this.showLoginModal();

            this.showNotification('👋 Đã đăng xuất', 'info');
        }
    }

    // ============================================
    // UI HELPERS
    // ============================================

    showAuthenticatedUI() {
        this.hideLoginModal();
        this.createUserMenu();
    }

    async loadUserData() {
        try {
            // Load dashboard data
            const dashboard = await window.apiClient.getDashboard();
            console.log('📊 Dashboard data loaded:', dashboard);

            // TODO: Update UI with dashboard data
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize AuthUI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authUI = new AuthUI();
    console.log('✅ Auth UI initialized');
});
