/**
 * User Model
 * Quản lý thông tin người dùng
 */
export class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.email = data.email || '';
        this.fullName = data.fullName || data.full_name || '';
        this.createdAt = data.createdAt || data.created_at || null;
    }

    /**
     * Kiểm tra user có được xác thực không
     */
    isAuthenticated() {
        return !!this.id && !!this.email;
    }

    /**
     * Lấy thông tin hiển thị
     */
    getDisplayName() {
        return this.fullName || this.email.split('@')[0];
    }

    /**
     * Chuyển sang object JSON
     */
    toJSON() {
        return {
            id: this.id,
            email: this.email,
            fullName: this.fullName,
            createdAt: this.createdAt
        };
    }

    /**
     * Tạo User từ localStorage
     */
    static fromLocalStorage() {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) return null;
            
            const data = JSON.parse(userData);
            return new User(data);
        } catch (error) {
            console.error('Error loading user from localStorage:', error);
            return null;
        }
    }

    /**
     * Lưu user vào localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('user', JSON.stringify(this.toJSON()));
        } catch (error) {
            console.error('Error saving user to localStorage:', error);
        }
    }

    /**
     * Xóa user khỏi localStorage
     */
    static removeFromLocalStorage() {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
    }
}
