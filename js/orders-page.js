import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { CartManager } from './cart.js';
import { OrderManager } from './orders.js';

ThemeManager.init();
if (!AuthManager.requireAuth()) throw new Error('Not authenticated');

const currentUser = AuthManager.getCurrentUser();
document.getElementById('user-name').textContent = currentUser.nama;
document.getElementById('user-name-mobile').textContent = currentUser.nama;

if (AuthManager.isAdmin()) {
  document.getElementById('admin-link')?.classList.remove('hidden');
  document.getElementById('admin-link-mobile')?.classList.remove('hidden');
}

document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
document.getElementById('hamburger-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.toggle('hidden');
});
document.getElementById('logout-btn')?.addEventListener('click', () => AuthManager.logout());
document.getElementById('logout-btn-mobile')?.addEventListener('click', () => AuthManager.logout());

CartManager.updateCartBadge();

const ordersContainer = document.getElementById('orders-container');
OrderManager.renderOrders(ordersContainer);

// Attach click events to order cards
ordersContainer?.addEventListener('click', (e) => {
  const card = e.target.closest('.order-card');
  if (card) {
    OrderManager.showOrderDetail(card.dataset.orderId);
  }
});
