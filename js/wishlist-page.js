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

async function renderWishlist() {
  await WishlistManager.renderWishlist(wishlistContainer);
  await CartManager.updateCartBadge();

  wishlistContainer?.querySelectorAll('.wishlist-remove').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.productId;
      try {
        await WishlistManager.removeItem(productId);
        Toast.warning('Produk dihapus dari wishlist');
        renderWishlist();
      } catch (err) {
        Toast.error('Gagal menghapus wishlist');
      }
    });
  });

  wishlistContainer?.querySelectorAll('.wishlist-add-cart').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.productId;
      const items = await WishlistManager.getItems();
      const item = items.find(i => String(i.productId || i.product_id) === String(productId));
      if (item) {
        try {
          await CartManager.addItem({ id: item.productId || item.product_id, nama: item.nama, harga: item.harga, gambar: item.gambar });
          await CartManager.updateCartBadge();
          Toast.success(`${item.nama} ditambahkan ke cart!`);
        } catch (err) {
          Toast.error('Gagal menambah ke cart');
        }
      }
    });
  });
}

renderWishlist();
