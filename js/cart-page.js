// js/cart-page.js
import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';
import { CartManager } from './cart.js';

ThemeManager.init();
if (!AuthManager.requireAuth()) throw new Error('Not authenticated');

const currentUser = AuthManager.getCurrentUser();
const cartContainer = document.getElementById('cart-items-container');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// Show user name
const userNameEl = document.getElementById('user-name');
if (userNameEl) userNameEl.textContent = currentUser.nama;
const userNameMobileEl = document.getElementById('user-name-mobile');
if (userNameMobileEl) userNameMobileEl.textContent = currentUser.nama;

// Show admin link if admin
if (AuthManager.isAdmin()) {
  document.getElementById('admin-link')?.classList.remove('hidden');
  document.getElementById('admin-link-mobile')?.classList.remove('hidden');
}

// Theme toggle
document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());

// Hamburger
document.getElementById('hamburger-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.toggle('hidden');
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => AuthManager.logout());
document.getElementById('logout-btn-mobile')?.addEventListener('click', () => AuthManager.logout());

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function updateTotal() {
  const total = CartManager.getTotal();
  const count = CartManager.getItemCount();
  if (cartTotalEl) {
    cartTotalEl.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Total item</span>
          <span>${count} item</span>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between font-bold text-lg text-gray-800 dark:text-white">
          <span>Total Harga</span>
          <span class="text-blue-500">${formatRupiah(total)}</span>
        </div>
      </div>
    `;
  }
  if (checkoutBtn) {
    checkoutBtn.disabled = count === 0;
    checkoutBtn.classList.toggle('opacity-50', count === 0);
    checkoutBtn.classList.toggle('cursor-not-allowed', count === 0);
  }
}

function renderCart() {
  CartManager.renderCartItems(cartContainer);
  CartManager.updateCartBadge();
  updateTotal();

  // Attach event listeners to rendered items
  cartContainer.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const action = btn.dataset.action;
      const items = CartManager.getItems();
      const item = items.find(i => i.productId === productId);
      if (!item) return;
      const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
      CartManager.updateQuantity(productId, newQty);
      renderCart();
    });
  });

  cartContainer.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      CartManager.removeItem(productId);
      Toast.warning('Item dihapus dari keranjang');
      renderCart();
    });
  });
}

// Checkout button
checkoutBtn?.addEventListener('click', () => {
  if (CartManager.getItemCount() > 0) {
    window.location.href = 'checkout.html';
  }
});

// Initial render
renderCart();
