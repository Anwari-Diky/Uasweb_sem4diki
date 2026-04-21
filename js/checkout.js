// js/checkout.js
import { StateManager } from './state.js';
import { CartManager } from './cart.js';

export class CheckoutManager {
  static validateForm(namaLengkap, alamat, nomorHP) {
    const errors = {};

    if (!namaLengkap || namaLengkap.trim().length < 2) {
      errors.namaLengkap = 'Nama lengkap minimal 2 karakter';
    }

    if (!alamat || alamat.trim().length < 10) {
      errors.alamat = 'Alamat minimal 10 karakter';
    }

    if (!this.validatePhone(nomorHP)) {
      errors.nomorHP = 'Nomor HP harus 10-13 digit angka';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return /^\d{10,13}$/.test(cleaned);
  }

  static generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `TRX-${timestamp}-${random}`;
  }

  static processCheckout(formData) {
    const currentUser = StateManager.get(StateManager.KEYS.CURRENT_USER);
    if (!currentUser) {
      return { success: false, message: 'User tidak ditemukan' };
    }

    const cartItems = CartManager.getItems();
    if (cartItems.length === 0) {
      return { success: false, message: 'Keranjang kosong' };
    }

    const order = {
      id: this.generateTransactionId(),
      userId: currentUser.id,
      items: cartItems.map(item => ({
        productId: item.productId,
        nama: item.nama,
        harga: item.harga,
        quantity: item.quantity,
        subtotal: item.harga * item.quantity,
      })),
      pengiriman: {
        namaLengkap: formData.namaLengkap.trim(),
        alamat: formData.alamat.trim(),
        nomorHP: formData.nomorHP.replace(/\D/g, ''),
      },
      totalHarga: CartManager.getTotal(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const orders = StateManager.get(StateManager.KEYS.ORDERS, []);
    orders.push(order);
    StateManager.set(StateManager.KEYS.ORDERS, orders);

    CartManager.clearCart();

    return { success: true, order };
  }

  static renderOrderSummary(containerEl) {
    const items = CartManager.getItems();
    const total = CartManager.getTotal();

    if (!containerEl) return;

    if (items.length === 0) {
      containerEl.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">Keranjang kosong</p>';
      return;
    }

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    containerEl.innerHTML = `
      <div class="space-y-3">
        ${items.map(item => `
          <div class="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
            <img src="${item.gambar}" alt="${item.nama}" class="w-12 h-12 object-cover rounded-lg" onerror="this.src='https://placehold.co/48x48?text=No+Image'">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">${item.nama}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">${item.quantity} x ${formatRupiah(item.harga)}</p>
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">${formatRupiah(item.harga * item.quantity)}</p>
          </div>
        `).join('')}
        <div class="pt-3 flex justify-between font-bold text-lg text-gray-800 dark:text-white">
          <span>Total</span>
          <span class="text-blue-500">${formatRupiah(total)}</span>
        </div>
      </div>
    `;
  }
}
