// ============================================
// Submission Confirmation Page
// ============================================

import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { icons } from '../utils/icons.js';
import { showNotification } from '../components/notification.js';

export function renderConfirmation(data = {}) {
  const app = document.getElementById('app');
  const issue = data.issue;

  if (!issue) {
    navigate('dashboard');
    return;
  }

  showNotification(t('notifIssueReported'), 'success');

  // Format tracking ID: CIV-<id>
  const trackingId = `CIV-${issue.id}`;

  app.innerHTML = `
    ${renderNavbar()}
    <div class="confirmation-page">
      <div class="confirmation-card">
        <div class="checkmark-circle">
          ${icons.check}
        </div>
        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 8px">
          ${t('confirmTitle')}
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px">
          ${t('confirmText')}
        </p>

        <div class="tracking-id" id="tracking-id-display">${trackingId}</div>

        <div class="ai-result-item" style="background: var(--bg); border-radius: var(--radius-md); margin-bottom: 8px; padding: 10px 16px;">
          <span class="ai-result-label">${t('statusLabel')}</span>
          <span class="badge badge-reported">${t('statusReported')}</span>
        </div>
        <div class="ai-result-item" style="background: var(--bg); border-radius: var(--radius-md); margin-bottom: 8px; padding: 10px 16px;">
          <span class="ai-result-label">${t('issueType')}</span>
          <span class="ai-result-value">${issue.issue_type}</span>
        </div>
        <div class="ai-result-item" style="background: var(--bg); border-radius: var(--radius-md); margin-bottom: 24px; padding: 10px 16px;">
          <span class="ai-result-label">${t('location')}</span>
          <span class="ai-result-value" style="font-size: 0.8rem">${issue.location || '---'}</span>
        </div>

        <div style="display: flex; gap: 12px; flex-direction: column">
          <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-track-issue">
            ${icons.track}
            ${t('trackIssue')}
          </button>
          <button class="btn btn-secondary btn-lg" style="width: 100%" id="btn-go-dashboard">
            ${icons.dashboard}
            ${t('goToDashboard')}
          </button>
        </div>
      </div>
    </div>
  `;

  attachNavListeners();

  document.getElementById('btn-track-issue')?.addEventListener('click', () => {
    navigate('tracking', { issueId: issue.id });
  });

  document.getElementById('btn-go-dashboard')?.addEventListener('click', () => {
    navigate('dashboard');
  });
}
