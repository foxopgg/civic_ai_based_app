// ============================================
// Login Page - Dual System (Login / Sign Up)
// ============================================

import { t, setLanguage } from '../utils/i18n.js';
import { setUser } from '../data/mockData.js';
import { navigate } from '../utils/router.js';
import { showNotification } from '../components/notification.js';
import { icons } from '../utils/icons.js';
import { supabase } from '../utils/supabase.js';

let generatedOTP = null;
let currentAuthMode = 'login'; // 'login' or 'signup'
let pendingSignupData = null; 

export function renderLogin() {
  const app = document.getElementById('app');
  generatedOTP = null;
  pendingSignupData = null;

  app.innerHTML = `
    <div class="login-page" id="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            ${icons.logo}
          </div>
          <h1>${currentAuthMode === 'login' ? t('loginTitle') : 'Create Account'}</h1>
          <p>${currentAuthMode === 'login' ? t('loginSubtitle') : 'Register to start reporting'}</p>
        </div>

        <div class="auth-tabs">
          <div class="auth-tab ${currentAuthMode === 'login' ? 'active' : ''}" id="tab-login">Login</div>
          <div class="auth-tab ${currentAuthMode === 'signup' ? 'active' : ''}" id="tab-signup">Sign Up</div>
        </div>

        <!-- LOGIN FORM -->
        <div id="login-form" style="display: ${currentAuthMode === 'login' ? 'block' : 'none'}">
          <div class="form-group">
            <label class="form-label" for="login-username-in">Username</label>
            <input type="text" class="form-input" id="login-username-in" placeholder="Enter your username" autocomplete="username" />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password-in">Password</label>
            <div class="pwd-wrapper">
              <input type="password" class="form-input" id="login-password-in" placeholder="Enter your password" autocomplete="current-password" />
              <button type="button" class="pwd-toggle" id="toggle-pwd-in">${icons.eye}</button>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-login">
            Login
          </button>
        </div>

        <!-- SIGN UP FORM -->
        <div id="signup-form" style="display: ${currentAuthMode === 'signup' ? 'block' : 'none'}">
          <div id="signup-step-1">
            <div class="form-group">
              <label class="form-label" for="login-name">${t('nameLabel')}</label>
              <input type="text" class="form-input" id="login-name" placeholder="${t('namePlaceholder')}" autocomplete="name" />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-username-up">Username (Unique)</label>
              <input type="text" class="form-input" id="login-username-up" placeholder="Pick a username" autocomplete="username" />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-phone">${t('phoneLabel')}</label>
              <input type="tel" class="form-input" id="login-phone" placeholder="${t('phonePlaceholder')}" maxlength="10" autocomplete="tel" />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password-up">Password</label>
              <div class="pwd-wrapper">
                <input type="password" class="form-input" id="login-password-up" placeholder="Create a password" autocomplete="new-password" />
                <button type="button" class="pwd-toggle" id="toggle-pwd-up">${icons.eye}</button>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">For Admin or Worker roles, password must end with "admin" or "worker".</p>
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

            <div class="form-group" id="work-type-group" style="display: none;">
              <label class="form-label" for="login-work-type">Type of Work</label>
              <select class="form-select" id="login-work-type">
                <option value="Electrical">Electrical</option>
                <option value="Road Repair">Road Repair</option>
                <option value="Garbage Management">Garbage Management</option>
                <option value="Plumbing">Plumbing</option>
              </select>
            </div>

            <div class="otp-status" id="otp-status"></div>

            <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-send-otp">
              Verify Phone & Register
            </button>
          </div>

          <!-- SIGN UP STEP 2: OTP VERIFICATION -->
          <div id="signup-step-2" style="display: none">
            <div class="form-group" style="text-align: center">
              <label class="form-label" style="text-align: center; margin-bottom: 16px">Enter OTP to verify phone</label>
              <div class="otp-inputs" id="otp-inputs">
                <input type="text" class="otp-input" maxlength="1" data-otp="0" inputmode="numeric" id="otp-0" />
                <input type="text" class="otp-input" maxlength="1" data-otp="1" inputmode="numeric" id="otp-1" />
                <input type="text" class="otp-input" maxlength="1" data-otp="2" inputmode="numeric" id="otp-2" />
                <input type="text" class="otp-input" maxlength="1" data-otp="3" inputmode="numeric" id="otp-3" />
              </div>
            </div>

            <div class="otp-status" id="otp-verify-status"></div>

            <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-verify-otp" disabled>
              Complete Registration
            </button>
          </div>
        </div>

        <p class="login-footer">${t('loginFooter')}</p>
      </div>
    </div>
  `;

  attachLoginListeners();
}

function attachLoginListeners() {
  // --- TAB TOGGLING ---
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  
  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      currentAuthMode = 'login';
      renderLogin();
    });
    tabSignup.addEventListener('click', () => {
      currentAuthMode = 'signup';
      renderLogin();
    });
  }

  // --- PASSWORD TOGGLES ---
  const initPwdToggle = (toggleId, inputId) => {
    const toggleBtn = document.getElementById(toggleId);
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const input = document.getElementById(inputId);
        if (input.type === 'password') input.type = 'text';
        else input.type = 'password';
      });
    }
  };
  initPwdToggle('toggle-pwd-in', 'login-password-in');
  initPwdToggle('toggle-pwd-up', 'login-password-up');

  // --- LOGIN LOGIC ---
  const loginBtn = document.getElementById('btn-login');
  if (loginBtn && currentAuthMode === 'login') {
    loginBtn.addEventListener('click', async () => {
      const username = document.getElementById('login-username-in').value.trim();
      const password = document.getElementById('login-password-in').value.trim();

      if (!username || !password) {
        showNotification('Please enter both username and password', 'warning');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.innerHTML = `<div class="spinner"></div> Logging in...`;

      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .eq('password', password);

        if (error) throw error;

        if (users && users.length > 0) {
          const user = users[0];
          
          if (user.role === 'admin' && !password.endsWith('admin')) {
              showNotification('Security Error: Invalid admin suffix format.', 'error');
              loginBtn.disabled = false;
              loginBtn.innerHTML = 'Login';
              return;
          }
          if (user.role === 'worker' && !password.endsWith('worker')) {
              showNotification('Security Error: Invalid worker suffix format.', 'error');
              loginBtn.disabled = false;
              loginBtn.innerHTML = 'Login';
              return;
          }

          setLanguage(user.language);
          setUser({
            id: user.id,
            name: user.name,
            phone: user.phone,
            language: user.language,
            role: user.role,
            work_type: user.work_type,
          });

          showNotification(`Welcome back, ${user.name}!`, 'success');
          
          if (user.role === 'admin') navigate('admin');
          else if (user.role === 'worker') navigate('worker-dashboard');
          else navigate('dashboard');
        } else {
          showNotification('Invalid username or password', 'error');
          loginBtn.disabled = false;
          loginBtn.innerHTML = 'Login';
        }
      } catch (err) {
        console.error('Login error:', err);
        showNotification('Database error during login', 'error');
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login';
      }
    });
  }

  // --- SIGNUP LOGIC ---
  if (currentAuthMode === 'signup') {
    let selectedRole = 'user';
    const langSelect = document.getElementById('login-language');
    const sendOtpBtn = document.getElementById('btn-send-otp');
    const verifyOtpBtn = document.getElementById('btn-verify-otp');
    const otpInputs = document.querySelectorAll('.otp-input');

    document.querySelectorAll('.role-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.role-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRole = btn.getAttribute('data-role');
        
        const workTypeGroup = document.getElementById('work-type-group');
        if (workTypeGroup) {
          workTypeGroup.style.display = selectedRole === 'worker' ? 'block' : 'none';
        }
      });
    });

    langSelect?.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });

    sendOtpBtn?.addEventListener('click', async () => {
      const name = document.getElementById('login-name').value.trim();
      const username = document.getElementById('login-username-up').value.trim();
      const phone = document.getElementById('login-phone').value.trim();
      const password = document.getElementById('login-password-up').value.trim();
      const lang = document.getElementById('login-language').value;
      const workType = document.getElementById('login-work-type')?.value;

      if (!name || !username || !phone || !password) {
        showNotification('Please fill all fields', 'warning');
        return;
      }
      
      if (phone.length < 10) {
        showNotification('Please enter a valid 10-digit phone number', 'warning');
        return;
      }

      if (selectedRole === 'admin' && !password.endsWith('admin')) {
        showNotification('Admin password must end with "admin"', 'warning');
        return;
      }
      if (selectedRole === 'worker' && !password.endsWith('worker')) {
        showNotification('Worker password must end with "worker"', 'warning');
        return;
      }

      sendOtpBtn.disabled = true;
      sendOtpBtn.innerHTML = `<div class="spinner"></div> Validating...`;

      try {
        const { data: existingUsers, error: unError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username);

        if (unError) throw unError;

        if (existingUsers && existingUsers.length > 0) {
          showNotification('Username already exists. Please choose another.', 'error');
          sendOtpBtn.disabled = false;
          sendOtpBtn.innerHTML = 'Verify Phone & Register';
          return;
        }

        pendingSignupData = { name, username, phone, password, role: selectedRole, language: lang, work_type: selectedRole === 'worker' ? workType : null };
        generatedOTP = '1111';

        const status = document.getElementById('otp-status');
        status.className = 'otp-status sent';
        status.innerHTML = `OTP Sent via SMS<br><strong style="font-size: 1.4rem; letter-spacing: 4px; color: var(--primary); display: block; margin-top: 8px">#OTP ${generatedOTP}</strong>`;

        document.getElementById('signup-step-1').style.display = 'none';
        document.getElementById('signup-step-2').style.display = 'block';
        document.getElementById('otp-0').focus();

      } catch (err) {
        console.error('Validation error:', err);
        showNotification('Database connection error', 'error');
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = 'Verify Phone & Register';
      }
    });

    otpInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val && idx < 3) otpInputs[idx + 1].focus();
        if (val) input.classList.add('filled');
        else input.classList.remove('filled');
        
        const otp = Array.from(otpInputs).map(i => i.value).join('');
        verifyOtpBtn.disabled = otp.length !== 4;
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          otpInputs[idx - 1].focus();
          otpInputs[idx - 1].value = '';
          otpInputs[idx - 1].classList.remove('filled');
        }
      });

      input.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key)) e.preventDefault();
      });
    });

    verifyOtpBtn?.addEventListener('click', async () => {
      const otp = Array.from(otpInputs).map(i => i.value).join('');
      const status = document.getElementById('otp-verify-status');
      
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.innerHTML = `<div class="spinner"></div> Creating Account...`;

      await delay(800);

      if (otp === generatedOTP && pendingSignupData) {
        try {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              name: pendingSignupData.name,
              username: pendingSignupData.username,
              password: pendingSignupData.password,
              phone: pendingSignupData.phone,
              role: pendingSignupData.role,
              language: pendingSignupData.language,
              work_type: pendingSignupData.work_type,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setLanguage(newUser.language);
          setUser({
            id: newUser.id,
            name: newUser.name,
            phone: newUser.phone,
            language: newUser.language,
            role: newUser.role,
            work_type: newUser.work_type,
          });

          showNotification(`Account created successfully! Hello ${newUser.name}!`, 'success');
          generatedOTP = null;
          pendingSignupData = null;

          if (newUser.role === 'admin') navigate('admin');
          else if (newUser.role === 'worker') navigate('worker-dashboard');
          else navigate('dashboard');

        } catch (err) {
          console.error('Registration error:', err);
          showNotification('Error creating account', 'error');
          verifyOtpBtn.disabled = false;
          verifyOtpBtn.innerHTML = 'Complete Registration';
        }
      } else {
        status.className = 'otp-status error';
        status.textContent = 'Invalid OTP';
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.innerHTML = 'Complete Registration';
        otpInputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
        otpInputs[0].focus();
      }
    });
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
