// js/state.js
export class StateManager {
  static KEYS = {
    USERS: 'users',
    CURRENT_USER: 'currentUser',
    ORDERS: 'orders',
    THEME: 'theme',
    cart: (userId) => `cart_${userId}`,
    wishlist: (userId) => `wishlist_${userId}`,
    PRODUCTS_OVERRIDE: 'products_override',
  };

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('StateManager.set error:', e);
    }
  }

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error('StateManager.get error:', e);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('StateManager.remove error:', e);
    }
  }

  static clearSession() {
    const currentUser = this.get(this.KEYS.CURRENT_USER);
    if (currentUser) {
      this.remove(this.KEYS.cart(currentUser.id));
    }
    this.remove(this.KEYS.CURRENT_USER);
  }
}
