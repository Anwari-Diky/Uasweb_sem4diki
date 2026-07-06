import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';
import { CartManager } from './cart.js';
import { CheckoutManager } from './checkout.js';

ThemeManager.init();
if (!AuthManager.requireAuth()) throw new Error('Not authenticated');

// Redirect if cart empty
async function checkCart() {
  const count = await CartManager.getItemCount();
  if (count === 0) {
    window.location.href = 'index.html';
  }
}
checkCart();

const currentUser = AuthManager.getCurrentUser();

// User info
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

// Render order summary
CheckoutManager.renderOrderSummary(document.getElementById('order-summary'));
CartManager.updateCartBadge();

// Form submit
const form = document.getElementById('checkout-form');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const namaLengkap = document.getElementById('nama-lengkap').value;
  const alamat = document.getElementById('alamat').value;
  const nomorHP = document.getElementById('nomor-hp').value;

  // Clear errors
  ['nama-error', 'alamat-error', 'hp-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['nama-lengkap', 'alamat', 'nomor-hp'].forEach(id => {
    document.getElementById(id)?.classList.remove('border-red-500');
  });

  const { valid, errors } = CheckoutManager.validateForm(namaLengkap, alamat, nomorHP);

  if (!valid) {
    if (errors.namaLengkap) {
      document.getElementById('nama-error').textContent = errors.namaLengkap;
      document.getElementById('nama-lengkap').classList.add('border-red-500');
    }
    if (errors.alamat) {
      document.getElementById('alamat-error').textContent = errors.alamat;
      document.getElementById('alamat').classList.add('border-red-500');
    }
    if (errors.nomorHP) {
      document.getElementById('hp-error').textContent = errors.nomorHP;
      document.getElementById('nomor-hp').classList.add('border-red-500');
    }
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Memproses...';
  submitBtn.disabled = true;

  const result = await CheckoutManager.processCheckout({ namaLengkap, alamat, nomorHP });

  if (result.success) {
    Toast.success('Pesanan berhasil dikonfirmasi!');
    // Show success section
    document.getElementById('checkout-form-section')?.classList.add('hidden');
    const successSection = document.getElementById('success-section');
    if (successSection) {
      successSection.classList.remove('hidden');
      document.getElementById('transaction-id').textContent = result.order.id;
    }
    await CartManager.updateCartBadge();
    
    // Redirect to WhatsApp after 2 seconds
    if (result.whatsappUrl) {
      setTimeout(() => {
        window.location.href = result.whatsappUrl;
      }, 2000);
    }
  } else {
    Toast.error(result.message || 'Terjadi kesalahan');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
