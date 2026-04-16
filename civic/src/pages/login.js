// ============================================
// Login Page - Dynamic OTP + Supabase User Management
// ============================================

import { t, setLanguage } from '../utils/i18n.js';
import { setUser } from '../data/mockData.js';
import { navigate } from '../utils/router.js';
import { showNotification } from '../components/notification.js';
import { icons } from '../utils/icons.js';
import { supabase } from '../utils/supabase.js';

// Dynamic OTP — resets on page refresh or new login attempt
let generatedOTP = null;

export function renderLogin() {
  const app = document.getElementById('app');

  // Reset OTP on re-render
  generatedOTP = null;

  app.innerHTML = `
    <div class="login-page" id="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            ${icons.logo}
          </div>
          <h1>${t('loginTitle')}</h1>
          <p>${t('loginSubtitle')}</p>
        </div>

        <div id="login-step-1">
          <div class="form-group">
            <label class="form-label" for="login-name">${t('nameLabel')}</label>
            <input type="text" class="form-input" id="login-name" placeholder="${t('namePlaceholder')}" autocomplete="name" />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-phone">${t('phoneLabel')}</label>
            <input type="tel" class="form-input" id="login-phone" placeholder="${t('phonePlaceholder')}" maxlength="10" autocomplete="tel" />
          </div>

          <div class="form-group">
            <label class="form-label">${t('roleLabel')}</label>
            <div class="role-selector" id="role-selector">
              <button type="button" class="role-option active" data-role="user" id="role-user">
                ${icons.user}
                <span>${t('roleUser')}</span>
              </button>
              <button type="button" class="role-option" data-role="worker" id="role-worker">
                ${icons.camera}
                <span>Worker</span>
              </button>
              <button type="button" class="role-option" data-role="admin" id="role-admin">
                ${icons.admin}
                <span>${t('roleAdmin')}</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-language">${t('languageLabel')}</label>
            <select class="form-select" id="login-language">
              <option value="en">English</option>
              <option value="ta">Tamil</option>
            </select>
          </div>

          <div class="otp-status" id="otp-status"></div>

          <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-send-otp">
            ${t('generateOtp')}
          </button>
        </div>

        <div id="login-step-2" style="display: none">
          <div class="form-group" style="text-align: center">
            <label class="form-label" style="text-align: center; margin-bottom: 16px">${t('otpLabel')}</label>
            <div class="otp-inputs" id="otp-inputs">
              <input type="text" class="otp-input" maxlength="1" data-otp="0" inputmode="numeric" id="otp-0" />
              <input type="text" class="otp-input" maxlength="1" data-otp="1" inputmode="numeric" id="otp-1" />
              <input type="text" class="otp-input" maxlength="1" data-otp="2" inputmode="numeric" id="otp-2" />
              <input type="text" class="otp-input" maxlength="1" data-otp="3" inputmode="numeric" id="otp-3" />
            </div>
          </div>

          <div class="otp-status" id="otp-verify-status"></div>

          <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-verify-otp" disabled>
            ${t('verifyOtp')}
          </button>
        </div>

        <p class="login-footer">${t('loginFooter')}</p>
      </div>
    </div>
  `;

  attachLoginListeners();
}

function attachLoginListeners() {
  const sendOtpBtn = document.getElementById('btn-send-otp');
  const verifyOtpBtn = document.getElementById('btn-verify-otp');
  const langSelect = document.getElementById('login-language');
  const otpInputs = document.querySelectorAll('.otp-input');
  let selectedRole = 'user';

  // Role selection
  document.querySelectorAll('.role-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.role-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.getAttribute('data-role');
    });
  });

  // Language change - re-render with new language
  langSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
    const name = document.getElementById('login-name').value;
    const phone = document.getElementById('login-phone').value;
    const lang = e.target.value;
    renderLogin();
    document.getElementById('login-name').value = name;
    document.getElementById('login-phone').value = phone;
    document.getElementById('login-language').value = lang;
    // Restore role
    if (selectedRole === 'admin') {
      document.getElementById('role-user')?.classList.remove('active');
      document.getElementById('role-admin')?.classList.add('active');
    } else if (selectedRole === 'worker') {
      document.getElementById('role-user')?.classList.remove('active');
      document.getElementById('role-worker')?.classList.add('active');
    }
  });

  // Generate OTP (was "Send OTP")
  sendOtpBtn.addEventListener('click', async () => {
    const name = document.getElementById('login-name').value.trim();
    const phone = document.getElementById('login-phone').value.trim();

    if (!name || !phone) {
      showNotification(t('fillAllFields'), 'warning');
      return;
    }

    if (phone.length < 10) {
      showNotification(t('validPhone'), 'warning');
      return;
    }

    const status = document.getElementById('otp-status');
    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = `<div class="spinner"></div> ${t('sendingOtp')}`;
    status.className = 'otp-status sending';
    status.textContent = t('sendingOtp');

    try {
      // Check Supabase users table for duplicate Name + Phone
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('name', name)
        .eq('phone', phone);

      if (checkError) {
        console.error('User check error:', checkError);
        showNotification(t('notifDbError'), 'error');
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = t('generateOtp');
        status.className = 'otp-status';
        status.textContent = '';
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        // Duplicate user found — block login
        status.className = 'otp-status error';
        status.textContent = t('duplicateUser');
        showNotification(t('duplicateUser'), 'error');
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = t('generateOtp');
        return;
      }

      // New user — generate random 4-digit OTP
      generatedOTP = String(Math.floor(1000 + Math.random() * 9000));

      // Display OTP on screen (demo purpose)
      status.className = 'otp-status sent';
      status.innerHTML = `${t('otpSent')}<br><strong style="font-size: 1.4rem; letter-spacing: 4px; color: var(--primary); display: block; margin-top: 8px">${t('otpDisplayPrefix')} ${generatedOTP}</strong>`;

      sendOtpBtn.style.display = 'none';

      document.getElementById('login-step-2').style.display = 'block';
      document.getElementById('otp-0').focus();

    } catch (err) {
      console.error('OTP generation error:', err);
      showNotification(t('notifDbError'), 'error');
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = t('generateOtp');
      status.className = 'otp-status';
      status.textContent = '';
    }
  });

  // OTP input handling
  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val && idx < 3) {
        otpInputs[idx + 1].focus();
      }
      if (val) {
        input.classList.add('filled');
      } else {
        input.classList.remove('filled');
      }
      checkOtpComplete();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && idx > 0) {
        otpInputs[idx - 1].focus();
        otpInputs[idx - 1].value = '';
        otpInputs[idx - 1].classList.remove('filled');
      }
    });

    input.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });
  });

  function checkOtpComplete() {
    const otp = Array.from(otpInputs).map(i => i.value).join('');
    verifyOtpBtn.disabled = otp.length !== 4;
  }

  // Verify OTP
  verifyOtpBtn.addEventListener('click', async () => {
    const otp = Array.from(otpInputs).map(i => i.value).join('');
    const name = document.getElementById('login-name').value.trim();
    const phone = document.getElementById('login-phone').value.trim();
    const lang = document.getElementById('login-language').value;

    const status = document.getElementById('otp-verify-status');
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = `<div class="spinner"></div> ${t('verifying')}`;

    await delay(800);

    if (otp === generatedOTP) {
      try {
        // Insert new user into Supabase users table
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            name: name,
            phone: phone,
            role: selectedRole,
            language: lang,
          })
          .select()
          .single();

        if (insertError) {
          console.error('User insert error:', insertError);
          showNotification(t('notifDbError'), 'error');
          verifyOtpBtn.disabled = false;
          verifyOtpBtn.innerHTML = t('verifyOtp');
          return;
        }

        console.log('✅ User created in Supabase:', newUser);

        // Store user with DB id in localStorage
        setLanguage(lang);
        setUser({
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          language: newUser.language,
          role: newUser.role,
        });

        showNotification(`${t('welcomeGreeting')}, ${name}!`, 'success');

        // Reset OTP
        generatedOTP = null;

        // Redirect based on role
        if (selectedRole === 'admin') {
          navigate('admin');
        } else if (selectedRole === 'worker') {
          navigate('worker-dashboard');
        } else {
          navigate('dashboard');
        }
      } catch (err) {
        console.error('Login error:', err);
        showNotification(t('notifDbError'), 'error');
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.innerHTML = t('verifyOtp');
      }
    } else {
      status.className = 'otp-status error';
      status.textContent = t('invalidOtp');
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.innerHTML = t('verifyOtp');
      otpInputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
      otpInputs[0].focus();
    }
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
