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

async function updateTotal() {
  const total = await CartManager.getTotal();
  const count = await CartManager.getItemCount();
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

async function renderCart() {
  await CartManager.renderCartItems(cartContainer);
  await CartManager.updateCartBadge();
  await updateTotal();

  // Attach event listeners to rendered items
  cartContainer.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cartId = btn.dataset.cartId;
      const action = btn.dataset.action;
      const items = await CartManager.getItems();
      const item = items.find(i => String(i.id) === String(cartId));
      if (!item) return;
      
      try {
        const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        await CartManager.updateQuantity(cartId, newQty);
        renderCart();
      } catch (err) {
        Toast.error('Gagal memperbarui jumlah');
      }
    });
  });

  cartContainer.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cartId = btn.dataset.cartId;
      try {
        await CartManager.removeItem(cartId);
        Toast.warning('Item dihapus dari keranjang');
        renderCart();
      } catch (err) {
        Toast.error('Gagal menghapus item');
      }
    });
  });
}

// Checkout button
checkoutBtn?.addEventListener('click', async () => {
  const count = await CartManager.getItemCount();
  if (count > 0) {
    window.location.href = 'checkout.html';
  }
});

// Initial render
renderCart();
