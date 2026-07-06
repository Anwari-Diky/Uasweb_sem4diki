// js/register.js
import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';

ThemeManager.init();
AuthManager.redirectIfLoggedIn();

const form = document.getElementById('register-form');
const namaInput = document.getElementById('nama');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const namaError = document.getElementById('nama-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');

function clearErrors() {
  [namaError, emailError, passwordError].forEach(el => el.textContent = '');
  [namaInput, emailInput, passwordInput].forEach(el => el.classList.remove('border-red-500'));
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    btnText.textContent = 'Memproses...';
    btnSpinner.classList.remove('hidden');
  } else {
    btnText.textContent = 'Daftar Sekarang';
    btnSpinner.classList.add('hidden');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const nama = namaInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  setLoading(true);

  const result = await AuthManager.register(nama, email, password);

  if (result.success) {
    Toast.success('Registrasi berhasil! Silakan login.');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  } else {
    setLoading(false);
    if (result.errors.nama) {
      namaError.textContent = result.errors.nama;
      namaInput.classList.add('border-red-500');
    }
    if (result.errors.email) {
      emailError.textContent = result.errors.email;
      emailInput.classList.add('border-red-500');
    }
    if (result.errors.password) {
      passwordError.textContent = result.errors.password;
      passwordInput.classList.add('border-red-500');
    }
  }
});

document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
