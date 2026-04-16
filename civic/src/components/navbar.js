// ============================================
// Navbar Component - Role-aware
// ============================================

import { t } from '../utils/i18n.js';
import { navigate, getCurrentRoute } from '../utils/router.js';
import { getUser, logout as logoutUser } from '../data/mockData.js';
import { icons } from '../utils/icons.js';
import { showNotification } from './notification.js';

export function renderNavbar() {
  const user = getUser();
  if (!user) return '';

  const currentPath = getCurrentRoute();
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const isAdmin = user.role === 'admin';

  return `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-brand" id="nav-brand">
        <div class="navbar-logo">CP</div>
        <span class="navbar-title">${t('appName')}</span>
      </div>
      <div class="navbar-nav">
        ${isAdmin ? `
          <button class="nav-link ${currentPath === 'admin' ? 'active' : ''}" data-nav="admin" id="nav-admin">
            ${icons.admin}
            <span>${t('navAdmin')}</span>
          </button>
        ` : `
          <button class="nav-link ${currentPath === 'dashboard' ? 'active' : ''}" data-nav="dashboard" id="nav-dashboard">
            ${icons.dashboard}
            <span>${t('navDashboard')}</span>
          </button>
          <button class="nav-link ${currentPath === 'report' ? 'active' : ''}" data-nav="report" id="nav-report">
            ${icons.report}
            <span>${t('navReport')}</span>
          </button>
        `}
      </div>
      <div class="navbar-user">
        <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-right: 6px; text-transform: uppercase; letter-spacing: 0.5px">${isAdmin ? t('roleAdminLabel') : t('roleUserLabel')}</span>
        <div class="user-avatar" id="nav-user-avatar" title="${user.name}">${initial}</div>
        <button class="nav-link" id="nav-logout" title="${t('navLogout')}">
          ${icons.logout}
        </button>
      </div>
    </nav>
    <div class="mobile-nav">
      <div class="mobile-nav-items">
        ${isAdmin ? `
          <button class="mobile-nav-item ${currentPath === 'admin' ? 'active' : ''}" data-nav="admin" id="mob-nav-admin">
            ${icons.admin}
            <span>${t('navAdmin')}</span>
          </button>
        ` : `
          <button class="mobile-nav-item ${currentPath === 'dashboard' ? 'active' : ''}" data-nav="dashboard" id="mob-nav-dashboard">
            ${icons.dashboard}
            <span>${t('navDashboard')}</span>
          </button>
          <button class="mobile-nav-item ${currentPath === 'report' ? 'active' : ''}" data-nav="report" id="mob-nav-report">
            ${icons.report}
            <span>${t('navReport')}</span>
          </button>
        `}
      </div>
    </div>
  `;
}

export function attachNavListeners() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-nav');
      navigate(page);
    });
  });

  const brand = document.getElementById('nav-brand');
  if (brand) {
    const user = getUser();
    brand.addEventListener('click', () => navigate(user?.role === 'admin' ? 'admin' : 'dashboard'));
  }

  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logoutUser();
      showNotification(t('notifLogout'), 'info');
      setTimeout(() => navigate('login'), 300);
    });
  }
}
