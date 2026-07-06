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

// --- LOGIKA ALAMAT INDONESIA ---
const API_WILAYAH = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const selectProvinsi = document.getElementById('provinsi');
const selectKota = document.getElementById('kota');
const selectKecamatan = document.getElementById('kecamatan');
const selectDesa = document.getElementById('desa');
const inputDetail = document.getElementById('detail-alamat');
const inputKodePos = document.getElementById('kode-pos');
const inputAlamatHidden = document.getElementById('alamat');

async function loadProvinces() {
  try {
    const res = await fetch(`${API_WILAYAH}/provinces.json`);
    const data = await res.json();
    data.forEach(prov => {
      const option = document.createElement('option');
      option.value = prov.id;
      option.textContent = prov.name;
      selectProvinsi?.appendChild(option);
    });
  } catch (err) {
    console.error('Gagal memuat provinsi:', err);
  }
}

if (selectProvinsi) {
  loadProvinces();

  selectProvinsi.addEventListener('change', async (e) => {
    selectKota.innerHTML = '<option value="">Pilih Kota/Kabupaten</option>';
    selectKecamatan.innerHTML = '<option value="">Pilih Kecamatan</option>';
    selectDesa.innerHTML = '<option value="">Pilih Desa/Kelurahan</option>';
    selectKota.disabled = true;
    selectKecamatan.disabled = true;
    selectDesa.disabled = true;

    if (!e.target.value) return;

    try {
      const res = await fetch(`${API_WILAYAH}/regencies/${e.target.value}.json`);
      const data = await res.json();
      data.forEach(kota => {
        const option = document.createElement('option');
        option.value = kota.id;
        option.textContent = kota.name;
        selectKota.appendChild(option);
      });
      selectKota.disabled = false;
    } catch (err) {}
  });

  selectKota.addEventListener('change', async (e) => {
    selectKecamatan.innerHTML = '<option value="">Pilih Kecamatan</option>';
    selectDesa.innerHTML = '<option value="">Pilih Desa/Kelurahan</option>';
    selectKecamatan.disabled = true;
    selectDesa.disabled = true;

    if (!e.target.value) return;

    try {
      const res = await fetch(`${API_WILAYAH}/districts/${e.target.value}.json`);
      const data = await res.json();
      data.forEach(kec => {
        const option = document.createElement('option');
        option.value = kec.id;
        option.textContent = kec.name;
        selectKecamatan.appendChild(option);
      });
      selectKecamatan.disabled = false;
    } catch (err) {}
  });

  selectKecamatan.addEventListener('change', async (e) => {
    selectDesa.innerHTML = '<option value="">Pilih Desa/Kelurahan</option>';
    selectDesa.disabled = true;

    if (!e.target.value) return;

    try {
      const res = await fetch(`${API_WILAYAH}/villages/${e.target.value}.json`);
      const data = await res.json();
      data.forEach(desa => {
        const option = document.createElement('option');
        option.value = desa.id;
        option.textContent = desa.name;
        selectDesa.appendChild(option);
      });
      selectDesa.disabled = false;
    } catch (err) {}
  });
}
// -----------------------------

// Form submit
const form = document.getElementById('checkout-form');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const namaLengkap = document.getElementById('nama-lengkap').value;
  
  // Gabungkan form alamat menjadi satu teks
  if (selectProvinsi?.value && selectKota?.value && selectKecamatan?.value && selectDesa?.value && inputDetail?.value && inputKodePos?.value) {
    const provText = selectProvinsi.options[selectProvinsi.selectedIndex].text;
    const kotaText = selectKota.options[selectKota.selectedIndex].text;
    const kecText = selectKecamatan.options[selectKecamatan.selectedIndex].text;
    const desaText = selectDesa.options[selectDesa.selectedIndex].text;
    
    inputAlamatHidden.value = `${inputDetail.value.trim()}, Kel. ${desaText}, Kec. ${kecText}, ${kotaText}, Provinsi ${provText}, ${inputKodePos.value.trim()}`;
  } else {
    inputAlamatHidden.value = ''; // Akan ditolak oleh validasi
  }

  const alamat = inputAlamatHidden.value;
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
