// ============================================
// User Dashboard Page - Supabase powered
// ============================================

import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { getUser, getActiveIssues, getCompletedIssues } from '../data/mockData.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { icons } from '../utils/icons.js';

export async function renderDashboard() {
  const app = document.getElementById('app');
  const user = getUser();

  // Show loading state first
  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <div class="dashboard-hero">
        <h2>${t('dashboardGreeting')}, ${user?.name || 'User'}!</h2>
        <p>${t('dashboardHeroText')}</p>
        <button class="btn btn-accent btn-lg" id="btn-report-issue">
          ${icons.report}
          ${t('reportIssueBtn')}
        </button>
      </div>
      <div style="text-align:center; padding: 60px 0">
        <div class="spinner-dark" style="margin: 0 auto; width: 32px; height: 32px"></div>
        <p style="margin-top: 12px; color: var(--text-muted)">${t('loading')}</p>
      </div>
    </div>
  `;
  attachNavListeners();
  document.getElementById('btn-report-issue')?.addEventListener('click', () => navigate('report'));

  // Fetch data from Supabase
  const [activeIssues, completedIssues] = await Promise.all([
    getActiveIssues(),
    getCompletedIssues()
  ]);

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <div class="dashboard-hero">
        <h2>${t('dashboardGreeting')}, ${user?.name || 'User'}!</h2>
        <p>${t('dashboardHeroText')}</p>
        <button class="btn btn-accent btn-lg" id="btn-report-issue">
          ${icons.report}
          ${t('reportIssueBtn')}
        </button>
      </div>

      <!-- Work in Progress Section -->
      <div class="section-header">
        <h3 class="section-title">
          <span class="dot"></span>
          ${t('workInProgress')}
        </h3>
        <span class="section-count">${activeIssues.length} ${activeIssues.length === 1 ? t('issueSingular') : t('issuePlural')}</span>
      </div>

      ${activeIssues.length > 0 ? `
        <div class="card-grid" id="active-issues-grid">
          ${activeIssues.map((issue, idx) => renderIssueCard(issue, idx)).join('')}
        </div>
      ` : `
        <div class="card" style="padding: 40px; text-align: center; margin-bottom: 36px;">
          <p style="color: var(--text-muted)">${t('noActiveIssues')}</p>
        </div>
      `}

      <!-- Completed Works Section -->
      <div class="section-header">
        <h3 class="section-title">
          ${icons.checkCircle}
          ${t('completedWorks')}
        </h3>
        <span class="section-count">${completedIssues.length} ${completedIssues.length === 1 ? t('issueSingular') : t('issuePlural')}</span>
      </div>

      ${completedIssues.length > 0 ? `
        <div class="card-grid" id="completed-issues-grid">
          ${completedIssues.map((issue, idx) => renderCompletedCard(issue, idx)).join('')}
        </div>
      ` : `
        <div class="card" style="padding: 40px; text-align: center; margin-bottom: 36px;">
          <p style="color: var(--text-muted)">${t('noCompletedIssues')}</p>
        </div>
      `}
    </div>
  `;

  attachNavListeners();
  attachDashboardListeners();
}

function getStatusBadge(status) {
  const map = {
    'Reported': 'reported',
    'Assigned': 'assigned',
    'In Progress': 'progress',
    'Completed': 'completed',
  };
  return map[status] || 'reported';
}

function renderIssueCard(issue, idx) {
  const statusClass = getStatusBadge(issue.status);
  const sevClass = (issue.severity || 'low').toLowerCase();
  const hasImage = issue.image_url && !issue.image_url.includes('undefined');

  return `
    <div class="card issue-card slide-up" style="animation-delay: ${idx * 0.08}s" data-issue-id="${issue.id}" id="issue-card-${issue.id}">
      <div class="card-image" ${hasImage ? '' : 'style="background: linear-gradient(135deg, #5D4037, #795548)"'}>
        ${hasImage ? `<img src="${issue.image_url}" alt="${issue.issue_type}" loading="lazy" />` : `<span style="color: rgba(255,255,255,0.7); font-weight: 600; font-size: 0.85rem">${issue.issue_type}</span>`}
      </div>
      <div class="card-body">
        <h4 class="card-title">${issue.issue_type}</h4>
        <p class="card-subtitle">${issue.description || ''}</p>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;">
          <span class="location-text">
            ${icons.location}
            ${issue.location || '---'}
          </span>
          <span class="badge badge-${statusClass}">${issue.status}</span>
        </div>
      </div>
    </div>
  `;
}

function renderCompletedCard(issue, idx) {
  const hasImage = issue.image_url && !issue.image_url.includes('undefined');
  const hasProof = issue.completion_proof_url && !issue.completion_proof_url.includes('undefined');

  return `
    <div class="card completed-card slide-up" style="animation-delay: ${idx * 0.08}s" data-issue-id="${issue.id}" id="completed-card-${issue.id}">
      <div class="before-after">
        <div class="before-after-item">
          ${hasImage
            ? `<img src="${issue.image_url}" alt="Before" loading="lazy" />`
            : `<div style="background: linear-gradient(135deg, #795548, #8D6E63); width:100%; height:100%; display:flex; align-items:center; justify-content:center"><span style="color:rgba(255,255,255,0.6); font-size:0.7rem; font-weight:600">Before</span></div>`
          }
          <span class="before-after-label before-label">${t('beforeLabel')}</span>
        </div>
        <div class="before-after-item">
          ${hasProof
            ? `<img src="${issue.completion_proof_url}" alt="After" loading="lazy" />`
            : `<div style="background: linear-gradient(135deg, #A5D6A7, #81C784); width:100%; height:100%; display:flex; align-items:center; justify-content:center"><span style="color:rgba(255,255,255,0.6); font-size:0.7rem; font-weight:600">After</span></div>`
          }
          <span class="before-after-label after-label">${t('afterLabel')}</span>
        </div>
      </div>
      <div class="card-body">
        <h4 class="card-title" style="color: var(--secondary)">${issue.issue_type}</h4>
        <span class="location-text">
          ${icons.location}
          ${issue.location || '---'}
        </span>
        <div class="completion-proof">
          ${icons.verified}
          <span>${t('verifiedCompleted')}</span>
        </div>
      </div>
    </div>
  `;
}

function attachDashboardListeners() {
  document.getElementById('btn-report-issue')?.addEventListener('click', () => navigate('report'));

  document.querySelectorAll('.issue-card, .completed-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const issueId = card.getAttribute('data-issue-id');
      navigate('tracking', { issueId });
    });
  });
}
