// ============================================
// CivicPulse - Main Application Entry Point
// Powered by Supabase - No mock data.
// ============================================

import './style.css';
import { registerRoute, navigate } from './src/utils/router.js';
import { loadUser } from './src/data/mockData.js';
import { loadLanguage } from './src/utils/i18n.js';
import { renderLogin } from './src/pages/login.js';
import { renderDashboard } from './src/pages/dashboard.js';
import { renderReportPage } from './src/pages/report.js';
import { renderConfirmation } from './src/pages/confirmation.js';
import { renderTracking } from './src/pages/tracking.js';
import { renderAdmin } from './src/pages/admin.js';
import { renderTaskManagement } from './src/pages/taskManagement.js';

// Register all routes
registerRoute('login', () => renderLogin());
registerRoute('dashboard', () => renderDashboard());
registerRoute('report', () => renderReportPage());
registerRoute('confirmation', (data) => renderConfirmation(data));
registerRoute('tracking', (data) => renderTracking(data));
registerRoute('admin', () => renderAdmin());
registerRoute('task', (data) => renderTaskManagement(data));

// Initialize Application
function init() {
  loadLanguage();

  const user = loadUser();

  if (user) {
    // Redirect based on role
    if (user.role === 'admin') {
      navigate('admin');
    } else {
      navigate('dashboard');
    }
  } else {
    navigate('login');
  }
}

init();
