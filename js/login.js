// js/login.js
import { AuthManager } from './auth.js';
import { ThemeManager } from './theme.js';
import { Toast } from './toast.js';

ThemeManager.init();
AuthManager.redirectIfLoggedIn();

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');

function clearErrors() {
  emailError.textContent = '';
  passwordError.textContent = '';
  emailInput.classList.remove('border-red-500');
  passwordInput.classList.remove('border-red-500');
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    btnText.textContent = 'Memproses...';
    btnSpinner.classList.remove('hidden');
  } else {
    btnText.textContent = 'Masuk';
    btnSpinner.classList.add('hidden');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let hasError = false;

  if (!AuthManager.validateEmail(email)) {
    emailError.textContent = 'Format email tidak valid';
    emailInput.classList.add('border-red-500');
    hasError = true;
  }

  if (!password) {
    passwordError.textContent = 'Password tidak boleh kosong';
    passwordInput.classList.add('border-red-500');
    hasError = true;
  }

  if (hasError) return;

  setLoading(true);

  const result = await AuthManager.login(email, password);

  if (result.success) {
    Toast.success(`Selamat datang, ${result.user.nama}!`);
    setTimeout(() => {
      if (result.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 800);
  } else {
    setLoading(false);
    emailError.textContent = result.message;
    emailInput.classList.add('border-red-500');
  }
});

document.getElementById('theme-toggle')?.addEventListener('click', () => ThemeManager.toggle());
