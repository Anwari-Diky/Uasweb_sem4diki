import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';
import { CartManager } from './cart.js';
import { WishlistManager } from './wishlist.js';

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

const wishlistContainer = document.getElementById('wishlist-container');

function renderWishlist() {
  WishlistManager.renderWishlist(wishlistContainer);
  CartManager.updateCartBadge();

  wishlistContainer?.querySelectorAll('.wishlist-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      WishlistManager.removeItem(btn.dataset.productId);
      Toast.warning('Produk dihapus dari wishlist');
      renderWishlist();
    });
  });

  wishlistContainer?.querySelectorAll('.wishlist-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      const items = WishlistManager.getItems();
      const item = items.find(i => i.productId === productId);
      if (item) {
        CartManager.addItem({ id: item.productId, nama: item.nama, harga: item.harga, gambar: item.gambar });
        CartManager.updateCartBadge();
        Toast.success(`${item.nama} ditambahkan ke cart!`);
      }
    });
  });
}

renderWishlist();
