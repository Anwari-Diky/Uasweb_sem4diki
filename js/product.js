// js/product.js
import { StateManager } from './state.js';
import { API } from './api.js';

export class ProductManager {
  static _cache = [];

  static async loadProducts() {
    try {
      const data = await API.get('/products');
      this._cache = data;
      return this._cache;
    } catch (error) {
      console.error('ProductManager.loadProducts error:', error);
      return [];
    }
  }

  static renderSkeleton(containerEl, count = 8) {
    containerEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse';
      skeleton.innerHTML = `
        <div class="aspect-square bg-gray-200 dark:bg-gray-700"></div>
        <div class="p-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div class="h-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      `;
      containerEl.appendChild(skeleton);
    }
  }

  static renderProductCard(product, wishlistIds = []) {
    const isWishlisted = wishlistIds.includes(product.id);
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col group';
    card.dataset.productId = product.id;

    const stars = this._renderStars(product.rating || 0);

    // Fallback for broken images from ephemeral Railway storage or mixed content localhost
    let imageUrl = product.gambar;
    if (imageUrl && (imageUrl.includes('localhost') || imageUrl.includes('specs-backend-production') || imageUrl.includes('unsplash'))) {
      imageUrl = 'https://placehold.co/400x400?text=Gambar+Produk';
    }

    card.innerHTML = `
      <div class="relative overflow-hidden">
        <a href="index.html?product=${product.id}" class="block">
          <img
            src="${imageUrl}"
            alt="${product.nama}"
            class="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            onerror="this.src='https://placehold.co/400x400?text=No+Image'"
          >
        </a>
        <!-- Wishlist Button -->
        <button
          class="wishlist-btn absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:scale-110 transition-all duration-200 ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}"
          data-product-id="${product.id}"
          aria-label="Tambah ke wishlist"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="${isWishlisted ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <!-- Category Badge -->
        <span class="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
          ${product.kategori}
        </span>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <a href="index.html?product=${product.id}" class="block">
          <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1 hover:text-blue-500 transition-colors">${product.nama}</h3>
        </a>
        <div class="flex items-center gap-1 mb-2">
          ${stars}
          <span class="text-xs text-gray-500 dark:text-gray-400">(${product.rating || 0})</span>
        </div>
        <p class="text-xl font-bold text-blue-500 mb-1">${this.formatRupiah(product.harga)}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Stok: ${product.stok || 0}</p>
        <div class="mt-auto">
          <button
            class="add-to-cart-btn w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
            data-product-id="${product.id}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Tambah ke Cart
          </button>
        </div>
      </div>
    `;
    return card;
  }

  static renderProducts(products, containerEl, wishlistIds = []) {
    containerEl.innerHTML = '';
    if (products.length === 0) {
      containerEl.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-lg font-semibold text-gray-500 dark:text-gray-400">Produk tidak ditemukan</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Coba ubah kata kunci atau filter pencarian</p>
        </div>
      `;
      return;
    }
    products.forEach(product => {
      containerEl.appendChild(this.renderProductCard(product, wishlistIds));
    });
  }

  static formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  }

  static getProductById(id) {
    return this._cache.find(p => p.id === id) || null;
  }

  static async saveProducts(products) {
    // This is historically used by admin, we will leave the signature but it won't be used directly like this anymore since admin operations hit API directly.
    this._cache = products;
  }

  static _renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    let stars = '';
    for (let i = 0; i < full; i++) {
      stars += '<svg class="h-3 w-3 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    if (half) {
      stars += '<svg class="h-3 w-3 text-amber-400" viewBox="0 0 20 20"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    for (let i = 0; i < empty; i++) {
      stars += '<svg class="h-3 w-3 text-gray-300 dark:text-gray-600 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
    }
    return `<div class="flex items-center gap-0.5">${stars}</div>`;
  }
}
