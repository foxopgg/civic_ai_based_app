// ============================================
// Tracking Page - Supabase powered
// ============================================

import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { getIssueById } from '../data/mockData.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { icons } from '../utils/icons.js';

const statusOrder = ['Reported', 'Assigned', 'In Progress', 'Completed'];
const statusLabels = {
  'Reported': () => t('reported'),
  'Assigned': () => t('assigned'),
  'In Progress': () => t('inProgress'),
  'Completed': () => t('completed'),
};

function getStatusIndex(status) {
  return statusOrder.indexOf(status);
}

export async function renderTracking(data = {}) {
  const app = document.getElementById('app');
  const issueId = data.issueId;

  if (!issueId) {
    navigate('dashboard');
    return;
  }

  // Loading
  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in" style="text-align:center; padding-top:100px">
      <div class="spinner-dark" style="margin:0 auto; width:32px; height:32px"></div>
      <p style="margin-top:12px; color:var(--text-muted)">${t('loading')}</p>
    </div>
  `;
  attachNavListeners();

  const issue = await getIssueById(issueId);
  if (!issue) {
    navigate('dashboard');
    return;
  }

  const currentStatusIdx = getStatusIndex(issue.status);
  const sevLabel = (issue.severity || 'Low') === 'High' ? t('severityHigh') :
                   issue.severity === 'Medium' ? t('severityMedium') : t('severityLow');
  const sevClass = (issue.severity || 'low').toLowerCase();

  const trackingId = `CIV-${issue.id}`;
  const reportedDate = issue.created_at ? new Date(issue.created_at).toLocaleString() : '---';

  // Build timeline entries from the status
  const timeline = buildTimeline(issue);

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <button class="back-btn" id="btn-back-dash">
        ${icons.arrowLeft}
        ${t('backToDashboard')}
      </button>

      <div class="tracking-card">
        <div class="tracking-header">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--primary)">${t('trackTitle')}</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem">${t('trackSubtitle')}</p>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps">
          ${statusOrder.map((status, idx) => {
            const isCompleted = idx <= currentStatusIdx;
            const isActive = idx === currentStatusIdx;
            const stepClass = isActive ? 'active' : isCompleted ? 'completed' : '';

            return `
              <div class="progress-step ${stepClass}">
                <div class="progress-step-circle">
                  ${isCompleted && !isActive ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>` : idx + 1}
                </div>
                <span>${statusLabels[status]()}</span>
              </div>
              ${idx < statusOrder.length - 1 ? `<div class="progress-connector ${idx < currentStatusIdx ? 'done' : ''}"></div>` : ''}
            `;
          }).join('')}
        </div>

        <!-- Issue Info -->
        <div class="tracking-issue-info">
          <div class="tracking-info-item">
            <label>${t('trackingId')}</label>
            <p style="font-family: monospace; letter-spacing: 1px">${trackingId}</p>
          </div>
          <div class="tracking-info-item">
            <label>${t('issueType')}</label>
            <p>${issue.issue_type}</p>
          </div>
          <div class="tracking-info-item">
            <label>${t('severity')}</label>
            <p><span class="badge badge-${sevClass}">${sevLabel}</span></p>
          </div>
          <div class="tracking-info-item">
            <label>${t('location')}</label>
            <p style="font-size: 0.85rem">${issue.location || '---'}</p>
          </div>
          ${issue.estimated_time ? `
            <div class="tracking-info-item">
              <label>${t('estimatedTime')}</label>
              <p>${issue.estimated_time}</p>
            </div>
          ` : ''}
          ${issue.assigned_worker ? `
            <div class="tracking-info-item">
              <label>${t('assignWorker')}</label>
              <p>${issue.assigned_worker}</p>
            </div>
          ` : ''}
        </div>

        <!-- Image -->
        ${issue.image_url ? `
          <div style="margin-bottom:24px">
            <img src="${issue.image_url}" alt="Issue" style="width:100%; max-height:250px; object-fit:cover; border-radius: var(--radius-md)" loading="lazy" />
          </div>
        ` : ''}

        <!-- Timeline -->
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 20px; color: var(--text-primary)">
          ${t('statusTimeline')}
        </h3>

        <div class="timeline" id="issue-timeline">
          ${timeline.map((entry, idx) => {
            const isLast = idx === timeline.length - 1;
            return `
              <div class="timeline-item ${isLast ? 'active' : 'completed'}" style="animation-delay: ${idx * 0.15}s">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>${entry.status}</h4>
                  <p>${entry.note}</p>
                  <span class="timestamp">${icons.clock} ${entry.time}</span>
                </div>
              </div>
            `;
          }).join('')}
          
          ${renderFutureSteps(issue.status)}
        </div>
      </div>
    </div>
  `;

  attachNavListeners();

  document.getElementById('btn-back-dash')?.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('civicUser') || '{}');
    navigate(user.role === 'admin' ? 'admin' : 'dashboard');
  });
}

function buildTimeline(issue) {
  const entries = [];
  const fmt = (d) => d ? new Date(d).toLocaleString() : '---';

  entries.push({
    status: t('reported'),
    time: fmt(issue.created_at),
    note: t('timelineReportedNote')
  });

  if (['Assigned', 'In Progress', 'Completed'].includes(issue.status)) {
    entries.push({
      status: t('assigned'),
      time: fmt(issue.created_at), // We don't track assignment time separately yet
      note: issue.assigned_worker ? `${t('timelineAssignedTo')} ${issue.assigned_worker}` : t('timelineAssignedNote')
    });
  }

  if (['In Progress', 'Completed'].includes(issue.status)) {
    entries.push({
      status: t('inProgress'),
      time: fmt(issue.created_at),
      note: t('timelineProgressNote')
    });
  }

  if (issue.status === 'Completed') {
    entries.push({
      status: t('completed'),
      time: fmt(issue.created_at),
      note: t('timelineCompletedNote')
    });
  }

  return entries;
}

function renderFutureSteps(currentStatus) {
  const currentIdx = getStatusIndex(currentStatus);
  let html = '';

  for (let i = currentIdx + 1; i < statusOrder.length; i++) {
    html += `
      <div class="timeline-item future">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h4 style="color: var(--text-muted)">${statusLabels[statusOrder[i]]()}</h4>
          <p style="color: var(--border)">${t('pending')}</p>
        </div>
      </div>
    `;
  }

  return html;
}
