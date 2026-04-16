// ============================================
// Task Management Page - Supabase powered
// ============================================

import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { getIssueById, getWorkers, assignWorker, updateIssueStatus, uploadProofImage, setCompletionProof } from '../data/mockData.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { showNotification } from '../components/notification.js';
import { icons } from '../utils/icons.js';

let proofFile = null;

export async function renderTaskManagement(data = {}) {
  const app = document.getElementById('app');
  const issueId = data.issueId;

  if (!issueId) {
    navigate('admin');
    return;
  }

  // Loading
  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in" style="text-align:center;padding-top:100px">
      <div class="spinner-dark" style="margin:0 auto;width:32px;height:32px"></div>
      <p style="margin-top:12px;color:var(--text-muted)">${t('loading')}</p>
    </div>
  `;
  attachNavListeners();

  const issue = await getIssueById(issueId);
  if (!issue) {
    navigate('admin');
    return;
  }

  const workers = getWorkers();
  const sevLabel = issue.severity === 'High' ? t('severityHigh') :
                   issue.severity === 'Medium' ? t('severityMedium') : t('severityLow');
  const sevClass = (issue.severity || 'low').toLowerCase();
  const statusBadgeClass = issue.status === 'In Progress' ? 'progress' :
                           issue.status === 'Assigned' ? 'assigned' :
                           issue.status === 'Completed' ? 'completed' : 'reported';
  const hasImage = issue.image_url && !issue.image_url.includes('undefined');

  proofFile = null;

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <button class="back-btn" id="btn-back-admin">
        ${icons.arrowLeft}
        ${t('navAdmin')}
      </button>

      <div class="task-management-card">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-bottom: 24px">${t('taskTitle')}</h2>

        <!-- Issue Header -->
        <div class="task-header">
          <div class="task-image">
            ${hasImage
              ? `<img src="${issue.image_url}" alt="${issue.issue_type}" loading="lazy" />`
              : `<div style="background:linear-gradient(135deg,#795548,#8D6E63);width:100%;height:100%;display:flex;align-items:center;justify-content:center"><span style="color:rgba(255,255,255,0.5);font-size:0.7rem;font-weight:600">${issue.issue_type}</span></div>`
            }
          </div>
          <div class="task-details">
            <h3>${issue.issue_type}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px">${issue.description || ''}</p>
            <div class="task-meta">
              <span class="badge badge-${sevClass}">${sevLabel}</span>
              <span class="badge badge-${statusBadgeClass}">${issue.status}</span>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="task-section">
          <div class="location-card">
            <div class="location-icon">${icons.location}</div>
            <div class="location-info">
              <h4>${issue.location || '---'}</h4>
              <p>${issue.location_lat ? `${issue.location_lat.toFixed(4)}, ${issue.location_lng.toFixed(4)}` : '---'}</p>
            </div>
          </div>
        </div>

        <!-- Assign Worker -->
        <div class="task-section">
          <h4 class="task-section-title">${t('assignWorker')}</h4>
          <select class="form-select" id="worker-select">
            <option value="">${t('selectWorker')}</option>
            ${workers.map(w => `
              <option value="${w.name}" ${issue.assigned_worker === w.name ? 'selected' : ''}>${w.name} (${w.id})</option>
            `).join('')}
          </select>
        </div>

        <!-- Estimated Time -->
        <div class="task-section">
          <h4 class="task-section-title">${t('estimatedTimeLabel')}</h4>
          <input type="text" class="form-input" id="estimated-time" placeholder="${t('estimatedTimePlaceholder')}" value="${issue.estimated_time || ''}" />
        </div>

        <!-- Status Update -->
        <div class="task-section">
          <h4 class="task-section-title">${t('updateStatus')}</h4>
          <div class="status-buttons" id="status-buttons">
            <button class="status-btn ${issue.status === 'Assigned' ? 'active-assigned' : ''}" data-status="Assigned" id="status-assigned">
              ${t('statusAssigned')}
            </button>
            <button class="status-btn ${issue.status === 'In Progress' ? 'active-progress' : ''}" data-status="In Progress" id="status-in-progress">
              ${t('statusInProgress')}
            </button>
            <button class="status-btn ${issue.status === 'Completed' ? 'active-completed' : ''}" data-status="Completed" id="status-completed">
              ${t('statusCompleted')}
            </button>
          </div>
        </div>

        <!-- Upload Proof -->
        <div class="task-section">
          <h4 class="task-section-title">${t('uploadProof')}</h4>
          <div class="upload-proof" id="upload-proof-area">
            ${issue.completion_proof_url
              ? `<img src="${issue.completion_proof_url}" alt="Completion proof" />`
              : `<div style="padding: 24px; text-align: center">
                  ${icons.upload}
                  <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px">${t('uploadProofText')}</p>
                </div>`
            }
          </div>
          <input type="file" accept="image/*" id="proof-input" style="display: none" />
        </div>

        <!-- Save -->
        <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-save-task">
          ${t('saveChanges')}
        </button>
      </div>
    </div>
  `;

  attachNavListeners();
  attachTaskListeners(issue);
}

function attachTaskListeners(issue) {
  let selectedStatus = issue.status;
  let selectedWorkerName = issue.assigned_worker || '';

  // Back button
  document.getElementById('btn-back-admin')?.addEventListener('click', () => navigate('admin'));

  // Worker select
  document.getElementById('worker-select')?.addEventListener('change', (e) => {
    selectedWorkerName = e.target.value;
  });

  // Status buttons
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-btn').forEach(b => {
        b.classList.remove('active-assigned', 'active-progress', 'active-completed');
      });
      const status = btn.getAttribute('data-status');
      selectedStatus = status;
      if (status === 'Assigned') btn.classList.add('active-assigned');
      if (status === 'In Progress') btn.classList.add('active-progress');
      if (status === 'Completed') btn.classList.add('active-completed');
    });
  });

  // Upload proof
  const uploadArea = document.getElementById('upload-proof-area');
  const proofInput = document.getElementById('proof-input');

  uploadArea?.addEventListener('click', () => {
    proofInput?.click();
  });

  proofInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      proofFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        uploadArea.classList.add('has-image');
        uploadArea.innerHTML = `<img src="${ev.target.result}" alt="Completion proof" />`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Save button
  const saveBtn = document.getElementById('btn-save-task');
  saveBtn?.addEventListener('click', async () => {
    const estimatedTime = document.getElementById('estimated-time')?.value.trim();

    if (selectedStatus === 'Assigned' && !selectedWorkerName) {
      showNotification(t('selectWorkerWarning'), 'warning');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `<div class="spinner"></div> ${t('saving')}`;

    try {
      if (selectedStatus === 'Assigned') {
        await assignWorker(issue.id, selectedWorkerName, estimatedTime);
        showNotification(t('workersAssigned'), 'success');
      } else if (selectedStatus === 'Completed' && proofFile) {
        // Upload proof image first
        const proofUrl = await uploadProofImage(proofFile);
        await setCompletionProof(issue.id, proofUrl);
        showNotification(t('notifStatusUpdated'), 'success');
      } else {
        await updateIssueStatus(issue.id, selectedStatus);
        showNotification(t('notifStatusUpdated'), 'success');
      }

      // Refresh
      setTimeout(() => {
        renderTaskManagement({ issueId: issue.id });
      }, 500);
    } catch (err) {
      console.error('Save error:', err);
      showNotification(t('notifDbError'), 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = t('saveChanges');
    }
  });
}
