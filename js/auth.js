// js/auth.js
import { StateManager } from './state.js';

export class AuthManager {
  static _seedAdmin() {
    const users = StateManager.get(StateManager.KEYS.USERS, []);
    const adminExists = users.some(u => u.email === 'admin@shop.com');
    if (!adminExists) {
      users.push({
        id: 'user_admin',
        nama: 'Administrator',
        email: 'admin@shop.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      StateManager.set(StateManager.KEYS.USERS, users);
    }
  }

  static register(nama, email, password) {
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

    const users = StateManager.get(StateManager.KEYS.USERS, []);
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, errors: { email: 'Email sudah terdaftar' } };
    }

    const newUser = {
      id: `user_${Date.now()}`,
      nama: nama.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    StateManager.set(StateManager.KEYS.USERS, users);
    return { success: true, message: 'Registrasi berhasil' };
  }

  static login(email, password) {
    const users = StateManager.get(StateManager.KEYS.USERS, []);
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Email atau password salah' };
    }

    const sessionUser = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };

    StateManager.set(StateManager.KEYS.CURRENT_USER, sessionUser);
    return { success: true, user: sessionUser };
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
      window.location.href = 'index.html';
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

// Seed admin on module load
AuthManager._seedAdmin();
