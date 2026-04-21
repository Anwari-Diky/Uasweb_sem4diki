import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';
import { CartManager } from './cart.js';
import { ProductManager } from './product.js';
import { AdminManager } from './admin.js';

ThemeManager.init();
if (!AuthManager.requireAuth()) throw new Error('Not authenticated');
if (!AuthManager.isAdmin()) {
  window.location.href = 'index.html';
  throw new Error('Not admin');
}

const currentUser = AuthManager.getCurrentUser();
document.getElementById('user-name').textContent = currentUser.nama;
document.getElementById('user-name-mobile').textContent = currentUser.nama;
document.getElementById('admin-link')?.classList.remove('hidden');
document.getElementById('admin-link-mobile')?.classList.remove('hidden');

document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
document.getElementById('hamburger-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-menu')?.classList.toggle('hidden');
});
document.getElementById('logout-btn')?.addEventListener('click', () => AuthManager.logout());
document.getElementById('logout-btn-mobile')?.addEventListener('click', () => AuthManager.logout());

CartManager.updateCartBadge();

const tableContainer = document.getElementById('product-table-container');

async function loadAndRenderTable() {
  await ProductManager.loadProducts();
  AdminManager.renderProductTable(tableContainer);
  attachTableEvents();
}

function attachTableEvents() {
  tableContainer?.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AdminManager.showProductForm(btn.dataset.productId);
      // Re-render after modal closes
      const observer = new MutationObserver(() => {
        if (!document.getElementById('product-form-modal')) {
          loadAndRenderTable();
          Toast.success('Produk berhasil diperbarui!');
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true });
    });
  });

  tableContainer?.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AdminManager.confirmDelete(btn.dataset.productId, () => {
        loadAndRenderTable();
        Toast.success('Produk berhasil dihapus!');
      });
    });
  });
}

document.getElementById('add-product-btn')?.addEventListener('click', () => {
  AdminManager.showProductForm(null);
  const observer = new MutationObserver(() => {
    if (!document.getElementById('product-form-modal')) {
      loadAndRenderTable();
      Toast.success('Produk baru berhasil ditambahkan!');
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });
});

loadAndRenderTable();
