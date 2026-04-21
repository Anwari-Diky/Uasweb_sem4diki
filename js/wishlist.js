// js/wishlist.js
import { StateManager } from './state.js';

export class WishlistManager {
  static _getKey() {
    const user = StateManager.get(StateManager.KEYS.CURRENT_USER, null);
    return user ? StateManager.KEYS.wishlist(user.id) : 'wishlist_guest';
  }

  static getItems() {
    return StateManager.get(this._getKey(), []);
  }

  static addItem(product) {
    const items = this.getItems();
    const exists = items.some(i => i.productId === product.id);
    if (!exists) {
      items.push({
        productId: product.id,
        nama: product.nama,
        harga: product.harga,
        gambar: product.gambar,
        addedAt: new Date().toISOString(),
      });
      StateManager.set(this._getKey(), items);
    }
  }

  static removeItem(productId) {
    const items = this.getItems().filter(i => i.productId !== productId);
    StateManager.set(this._getKey(), items);
  }

  static toggleItem(product) {
    if (this.isInWishlist(product.id)) {
      this.removeItem(product.id);
    } else {
      this.addItem(product);
    }
  }

  static isInWishlist(productId) {
    return this.getItems().some(i => i.productId === productId);
  }

  static renderWishlist(containerEl) {
    const items = this.getItems();
    if (!containerEl) return;

    if (items.length === 0) {
      containerEl.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">Wishlist Anda masih kosong</p>
          <a href="index.html" class="mt-4 text-blue-500 hover:text-blue-600 font-medium transition-colors">Jelajahi produk</a>
        </div>
      `;
      return;
    }

    containerEl.innerHTML = items.map(item => `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col" data-wishlist-item="${item.productId}">
        <img src="${item.gambar}" alt="${item.nama}" class="w-full aspect-square object-cover" onerror="this.src='https://placehold.co/400x400?text=No+Image'">
        <div class="p-4 flex flex-col flex-1">
          <h3 class="font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1">${item.nama}</h3>
          <p class="text-blue-500 font-bold mb-4">${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.harga)}</p>
          <div class="mt-auto flex gap-2">
            <button class="wishlist-add-cart flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors" data-product-id="${item.productId}">
              Tambah ke Cart
            </button>
            <button class="wishlist-remove p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors" data-product-id="${item.productId}" aria-label="Hapus dari wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}
