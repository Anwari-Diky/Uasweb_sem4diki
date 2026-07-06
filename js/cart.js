// js/cart.js
import { StateManager } from './state.js';
import { API } from './api.js';

export class CartManager {
  static async getItems() {
    try {
      const user = StateManager.get(StateManager.KEYS.CURRENT_USER);
      if (!user) return [];
      const data = await API.get('/cart');
      return data; // Returns array of {id, product_id, quantity, nama, harga, gambar, stok}
    } catch (error) {
      console.error('Failed to get cart:', error);
      return [];
    }
  }

  static async addItem(product, quantity = 1) {
    try {
      await API.post('/cart', { productId: product.id, quantity });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }

  static async removeItem(cartItemId) {
    try {
      await API.delete(`/cart/${cartItemId}`);
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  }

  static async updateQuantity(cartItemId, quantity) {
    if (quantity <= 0) {
      return this.removeItem(cartItemId);
    }
    try {
      await API.put(`/cart/${cartItemId}`, { quantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  }

  static async getTotal() {
    const items = await this.getItems();
    return items.reduce((sum, i) => sum + i.harga * i.quantity, 0);
  }

  static async getItemCount() {
    const items = await this.getItems();
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }

  static async clearCart() {
    // Handled by checkout on backend, or we can loop and delete if needed manually.
    // For now we assume checkout clears it.
  }

  static async updateCartBadge() {
    const count = await this.getItemCount();
    document.querySelectorAll('.cart-badge').forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    });
  }

  static async renderCartItems(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '<div class="py-8 text-center"><p class="text-gray-500">Memuat keranjang...</p></div>';
    
    const items = await this.getItems();

    if (items.length === 0) {
      containerEl.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">Keranjang belanja Anda kosong</p>
          <a href="index.html" class="mt-4 text-blue-500 hover:text-blue-600 font-medium transition-colors">Mulai belanja</a>
        </div>
      `;
      return;
    }

    containerEl.innerHTML = items.map(item => `
      <div class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700" data-cart-item="${item.id}">
        <img src="${item.gambar}" alt="${item.nama}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src='https://placehold.co/64x64?text=No+Image'">
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 dark:text-gray-100 truncate">${item.nama}</p>
          <p class="text-blue-500 font-bold text-sm">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga)}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="qty-btn w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-action="decrease" data-cart-id="${item.id}">−</button>
          <span class="w-8 text-center font-semibold text-gray-800 dark:text-gray-100">${item.quantity}</span>
          <button class="qty-btn w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-action="increase" data-cart-id="${item.id}">+</button>
        </div>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 w-24 text-right">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga * item.quantity)}</p>
        <button class="remove-btn text-red-400 hover:text-red-600 transition-colors p-1" data-cart-id="${item.id}" aria-label="Hapus item">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `).join('');
  }
}
