// js/main.js
import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';
import { ProductManager } from './product.js?v=3';
import { CartManager } from './cart.js';
import { WishlistManager } from './wishlist.js';
import { SearchFilter } from './search.js';
import { PaginationManager } from './pagination.js';
import { API } from './api.js';

// Init
ThemeManager.init();
if (!AuthManager.requireAuth()) throw new Error('Not authenticated');

const currentUser = AuthManager.getCurrentUser();
const productGrid = document.getElementById('product-grid');
const paginationContainer = document.getElementById('pagination-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const resetFilterBtn = document.getElementById('reset-filter');
const productCount = document.getElementById('product-count');

let searchFilter;
let pagination;
let allProducts = [];

// Show admin link if admin
if (AuthManager.isAdmin()) {
  const adminLink = document.getElementById('admin-link');
  if (adminLink) adminLink.classList.remove('hidden');
  const adminLinkMobile = document.getElementById('admin-link-mobile');
  if (adminLinkMobile) adminLinkMobile.classList.remove('hidden');
}

// Show user name
const userNameEl = document.getElementById('user-name');
if (userNameEl) userNameEl.textContent = currentUser.nama;
const userNameMobileEl = document.getElementById('user-name-mobile');
if (userNameMobileEl) userNameMobileEl.textContent = currentUser.nama;

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
  AuthManager.logout();
});
document.getElementById('logout-btn-mobile')?.addEventListener('click', () => {
  AuthManager.logout();
});

// Theme toggle
document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());

// Hamburger menu
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');
hamburgerBtn?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('hidden');
});

// Hero search syncs with filter search
document.getElementById('hero-search')?.addEventListener('input', (e) => {
  const val = e.target.value;
  if (searchInput) searchInput.value = val;
  searchFilter?.setKeyword(val);
});

// Cart badge update
CartManager.updateCartBadge();

// Load products
async function loadAndRender() {
  ProductManager.renderSkeleton(productGrid, 8);
  CartManager.updateCartBadge();
  await loadBanner();

  allProducts = await ProductManager.loadProducts();

  if (allProducts.length === 0) {
    productGrid.innerHTML = '<div class="col-span-full text-center py-16 text-gray-500 dark:text-gray-400">Gagal memuat produk. Silakan coba lagi.</div>';
    return;
  }

  // Populate category dropdown
  const categories = SearchFilter.getCategories(allProducts);
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Init pagination
  pagination = new PaginationManager(8);

  // Init search filter
  searchFilter = new SearchFilter(allProducts, (filtered) => {
    pagination.setItems(filtered);
    renderCurrentPage();
    if (productCount) productCount.textContent = `${filtered.length} produk ditemukan`;
  });

  // Initial render
  searchFilter.applyFilters();
}

async function renderCurrentPage() {
  const items = pagination.getCurrentPageItems();
  const wishlistItems = await WishlistManager.getItems();
  const wishlistIds = wishlistItems.map(w => w.productId || w.product_id);
  ProductManager.renderProducts(items, productGrid, wishlistIds);
  pagination.renderControls(paginationContainer, () => {
    renderCurrentPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Attach cart button events
  productGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      const product = ProductManager.getProductById(productId);
      if (product) {
        try {
          await CartManager.addItem(product);
          await CartManager.updateCartBadge();
          Toast.success(`${product.nama} ditambahkan ke cart!`);
        } catch(e) {
          Toast.error('Gagal menambahkan ke cart');
        }
      }
    });
  });

  // Attach wishlist button events
  productGrid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      const product = ProductManager.getProductById(productId);
      if (product) {
        try {
          await WishlistManager.toggleItem(product);
          const isNowWishlisted = await WishlistManager.isInWishlist(productId);
          // Update button appearance
          const svg = btn.querySelector('svg');
          if (isNowWishlisted) {
            btn.classList.add('text-red-500');
            btn.classList.remove('text-gray-400');
            svg.setAttribute('fill', 'currentColor');
            Toast.success(`${product.nama} ditambahkan ke wishlist!`);
          } else {
            btn.classList.remove('text-red-500');
            btn.classList.add('text-gray-400');
            svg.setAttribute('fill', 'none');
            Toast.warning(`${product.nama} dihapus dari wishlist`);
          }
        } catch(e) {
          Toast.error('Gagal memperbarui wishlist');
        }
      }
    });
  });

  // Attach product card click for detail modal
  productGrid.querySelectorAll('[data-product-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('a')) return;
      const productId = card.dataset.productId;
      const product = ProductManager.getProductById(productId);
      if (product) showProductModal(product);
    });
  });
}

// Product detail modal
async function showProductModal(product) {
  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('modal-content');
  if (!modal || !modalContent) return;

  const isWishlisted = await WishlistManager.isInWishlist(product.id);
  const stars = ProductManager._renderStars(product.rating || 0);

  modalContent.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="md:w-1/2">
        <img src="${product.gambar}" alt="${product.nama}" class="w-full rounded-xl object-cover aspect-square" onerror="this.src='https://placehold.co/400x400?text=No+Image'">
      </div>
      <div class="md:w-1/2 flex flex-col">
        <span class="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full mb-2 w-fit">${product.kategori}</span>
        <h2 id="modal-title" class="text-2xl font-bold text-gray-800 dark:text-white mb-2">${product.nama}</h2>
        <div class="flex items-center gap-2 mb-3">
          ${stars}
          <span class="text-sm text-gray-500 dark:text-gray-400">${product.rating} / 5.0</span>
        </div>
        <p class="text-3xl font-bold text-blue-500 mb-3">${ProductManager.formatRupiah(product.harga)}</p>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">${product.deskripsi}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Stok tersedia: <span class="font-semibold text-gray-700 dark:text-gray-200">${product.stok}</span></p>
        <div class="flex gap-3 mt-auto">
          <button id="modal-add-cart" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Tambah ke Cart
          </button>
          <button id="modal-wishlist" class="p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-400'}" aria-label="Toggle wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="${isWishlisted ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  document.getElementById('modal-add-cart')?.addEventListener('click', async () => {
    try {
      await CartManager.addItem(product);
      await CartManager.updateCartBadge();
      Toast.success(`${product.nama} ditambahkan ke cart!`);
    } catch(e) {
      Toast.error('Gagal menambahkan ke cart');
    }
  });

  document.getElementById('modal-wishlist')?.addEventListener('click', async (e) => {
    try {
      await WishlistManager.toggleItem(product);
      const btn = e.currentTarget;
      const svg = btn.querySelector('svg');
      const isNow = await WishlistManager.isInWishlist(product.id);
      btn.classList.toggle('text-red-500', isNow);
      btn.classList.toggle('text-gray-400', !isNow);
      svg.setAttribute('fill', isNow ? 'currentColor' : 'none');
      Toast[isNow ? 'success' : 'warning'](`${product.nama} ${isNow ? 'ditambahkan ke' : 'dihapus dari'} wishlist`);
    } catch(err) {
      Toast.error('Gagal update wishlist');
    }
  });
}

// Close modal
document.getElementById('close-modal')?.addEventListener('click', closeModal);
document.getElementById('product-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function closeModal() {
  document.getElementById('product-modal')?.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

// Filter events
searchInput?.addEventListener('input', (e) => searchFilter?.setKeyword(e.target.value));
categoryFilter?.addEventListener('change', (e) => searchFilter?.setCategory(e.target.value));
minPriceInput?.addEventListener('input', () => searchFilter?.setPriceRange(minPriceInput.value, maxPriceInput.value));
maxPriceInput?.addEventListener('input', () => searchFilter?.setPriceRange(minPriceInput.value, maxPriceInput.value));
resetFilterBtn?.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = '';
  minPriceInput.value = '';
  maxPriceInput.value = '';
  const heroSearch = document.getElementById('hero-search');
  if (heroSearch) heroSearch.value = '';
  searchFilter?.reset();
});

// Check URL for product detail
const urlParams = new URLSearchParams(window.location.search);
const productIdFromUrl = urlParams.get('product');

loadAndRender().then(() => {
  if (productIdFromUrl) {
    const product = ProductManager.getProductById(productIdFromUrl);
    if (product) showProductModal(product);
  }
});

// Load Banner Function
async function loadBanner() {
  try {
    const res = await API.get('/settings/banner');
    if (res && res.url) {
      const heroBg = document.getElementById('hero-bg');
      if (heroBg) {
        heroBg.style.backgroundImage = `url('${res.url}')`;
      }
    }
  } catch(e) {
    console.error('Failed to load banner', e);
  }
}

