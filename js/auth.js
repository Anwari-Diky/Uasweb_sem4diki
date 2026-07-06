// js/auth.js
import { StateManager } from './state.js';
import { API } from './api.js';

export class AuthManager {
  static async register(nama, email, password) {
    const errors = {};

    if (!nama || nama.trim().length < 2) {
      errors.nama = 'Nama minimal 2 karakter';
    }
    if (!this.validateEmail(email)) {
      errors.email = 'Format email tidak valid';
    }
    if (!this.validatePassword(password)) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    try {
      const response = await API.post('/auth/register', { nama, email, password });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, errors: { email: error.message } };
    }
  }

  static async login(email, password) {
    try {
      const user = await API.post('/auth/login', { email, password });
      StateManager.set(StateManager.KEYS.CURRENT_USER, user);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static logout() {
    StateManager.clearSession();
    window.location.href = 'login.html';
  }

  static getCurrentUser() {
    return StateManager.get(StateManager.KEYS.CURRENT_USER, null);
  }

  static requireAuth() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  static redirectIfLoggedIn() {
    const user = this.getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  }

  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase().trim());
  }

  static validatePassword(password) {
    return password && password.length >= 6;
  }

  static isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
}

