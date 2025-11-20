/**
 * APIService - Xử lý tất cả API requests
 */
import { User } from '../models/User.js';

export class APIService {
    constructor() {
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
        
        this.baseURL = isLocal ? 'http://localhost:3000/api' : '/api';
        this.token = localStorage.getItem('authToken');
        
        console.log('🔌 APIService initialized:', this.baseURL);
    }

    /**
     * Generic fetch wrapper
     */
    async fetch(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Đăng ký
     */
    async register(email, password, fullName) {
        const data = await this.fetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName })
        });

        this.token = data.token;
        localStorage.setItem('authToken', this.token);
        
        const user = new User(data.user);
        user.saveToLocalStorage();

        return user;
    }

    /**
     * Đăng nhập
     */
    async login(email, password) {
        const data = await this.fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        this.token = data.token;
        localStorage.setItem('authToken', this.token);
        
        const user = new User(data.user);
        user.saveToLocalStorage();

        return user;
    }

    /**
     * Lấy user hiện tại
     */
    getCurrentUser() {
        return User.fromLocalStorage();
    }

    /**
     * Đăng xuất
     */
    logout() {
        this.token = null;
        User.removeFromLocalStorage();
    }

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isAuthenticated() {
        const user = this.getCurrentUser();
        return user && user.isAuthenticated();
    }

    /**
     * Bắt đầu session
     */
    async startSession() {
        if (!this.isAuthenticated()) return null;
        
        return await this.fetch('/sessions/start', {
            method: 'POST'
        });
    }

    /**
     * Kết thúc session
     */
    async endSession(sessionId, data) {
        if (!this.isAuthenticated()) return null;
        
        return await this.fetch('/sessions/end', {
            method: 'POST',
            body: JSON.stringify({ sessionId, ...data })
        });
    }

    /**
     * Lưu emotion
     */
    async saveEmotion(emotionData) {
        if (!this.isAuthenticated()) return null;
        
        return await this.fetch('/emotions', {
            method: 'POST',
            body: JSON.stringify(emotionData)
        });
    }

    /**
     * Lưu note
     */
    async saveNote(noteData) {
        if (!this.isAuthenticated()) return null;
        
        return await this.fetch('/notes', {
            method: 'POST',
            body: JSON.stringify(noteData)
        });
    }

    /**
     * Lấy thống kê
     */
    async getStats(params = {}) {
        if (!this.isAuthenticated()) return null;
        
        const queryString = new URLSearchParams(params).toString();
        return await this.fetch(`/stats?${queryString}`);
    }
}
