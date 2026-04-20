import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { getWorkerIssues, getUser, getUnassignedWorkerJobs, claimJob } from '../data/mockData.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { showNotification } from '../components/notification.js';
import { icons } from '../utils/icons.js';

let currentTab = 'available';

export async function renderWorkerDashboard() {
  const app = document.getElementById('app');
  const user = getUser();
  
  if (!user || user.role !== 'worker') {
    navigate('login');
    return;
  }

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in" style="text-align:center;padding-top:100px">
      <div class="spinner-dark" style="margin:0 auto;width:32px;height:32px"></div>
    </div>
  `;
  attachNavListeners();

  const issues = await getWorkerIssues(user.id);
  const inProgress = issues.filter(i => i.status === 'In Progress' || i.status === 'Assigned');
  const completed = issues.filter(i => i.status === 'Completed');
  
  const unassignedJobs = await getUnassignedWorkerJobs(user.work_type);

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <div class="dashboard-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Worker Dashboard</h1>
          <p class="page-subtitle">Welcome, ${user.name} | ${user.work_type || 'Worker'} Specialist</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 24px; padding: 20px; text-align: center;">
        <h3 style="margin-bottom: 12px; color: var(--primary)">Quick Stats</h3>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <div style="padding: 12px 24px; background: rgba(33,150,243,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: #2196F3">${unassignedJobs.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Available</p>
            </div>
            <div style="padding: 12px 24px; background: rgba(255,160,0,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: #FFA000">${inProgress.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Active Task</p>
            </div>
            <div style="padding: 12px 24px; background: rgba(76,175,80,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: #4CAF50">${completed.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Completed</p>
            </div>
        </div>
      </div>

      <div class="admin-tabs" style="margin-bottom: 24px; display: flex; justify-content: center;">
        <button class="admin-tab ${currentTab === 'available' ? 'active' : ''}" data-tab="available">
          ${icons.alertCircle} Available Jobs <span class="tab-count">${unassignedJobs.length}</span>
        </button>
        <button class="admin-tab ${currentTab === 'assigned' ? 'active' : ''}" data-tab="assigned">
          ${icons.report} My Assignments <span class="tab-count">${issues.length}</span>
        </button>
      </div>

      <div id="worker-tab-content">
        ${renderTabContent(currentTab, { unassignedJobs, issues, user })}
      </div>
    </div>
  `;

  attachNavListeners();
  attachDashboardListeners(user);
}

function renderTabContent(tab, data) {
  if (tab === 'available') {
    return data.unassignedJobs.length === 0 ? `
      <div class="placeholder-card" style="text-align: center; padding: 40px; background: white; border-radius: 12px;">
        ${icons.success}
        <p style="margin-top: 12px; color: var(--text-muted)">No new jobs available for your work type.</p>
      </div>
    ` : `
      <div class="task-grid">
        ${data.unassignedJobs.map(issue => {
          const sevClass = (issue.severity || 'low').toLowerCase();
          return `
          <div class="card fade-in" style="border-left: 4px solid var(--severity-${sevClass})">
              <div class="card-body">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
                      <h3 style="font-size: 1.1rem; color: var(--textDark)">${issue.issue_type}</h3>
                      <span class="badge badge-reported">${issue.status}</span>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      ${issue.description || 'No description provided'}
                  </p>
                  <div style="display:flex; align-items:center; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
                      ${icons.location}
                      <span style="margin-left: 6px;">${issue.location}</span>
                  </div>
                  <button class="btn btn-primary btn-sm btn-claim" data-issue-id="${issue.id}" style="width: 100%">Claim Job</button>
              </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }
  
  if (tab === 'assigned') {
    return data.issues.length === 0 ? `
      <div class="placeholder-card" style="text-align: center; padding: 40px; background: white; border-radius: 12px;">
        ${icons.success}
        <p style="margin-top: 12px; color: var(--text-muted)">No active assignments. Claim a job first!</p>
      </div>
    ` : `
      <div class="task-grid">
        ${data.issues.map(issue => {
          const sevClass = (issue.severity || 'low').toLowerCase();
          const statusClass = issue.status === 'Completed' ? 'completed' : 'progress';
          return `
          <div class="card fade-in" style="cursor: pointer; border-left: 4px solid var(--severity-${sevClass})" onclick="window.location.hash='#worker-task?issueId=${issue.id}'">
              <div class="card-body">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
                      <h3 style="font-size: 1.1rem; color: var(--textDark)">${issue.issue_type}</h3>
                      <span class="badge badge-${statusClass}">${issue.status}</span>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      ${issue.description || 'No description provided'}
                  </p>
                  <div style="display:flex; align-items:center; font-size: 0.8rem; color: var(--text-muted)">
                      ${icons.location}
                      <span style="margin-left: 6px;">${issue.location}</span>
                  </div>
              </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }
}

function attachDashboardListeners(user) {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.getAttribute('data-tab');
      renderWorkerDashboard();
    });
  });

  document.querySelectorAll('.btn-claim').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const issueId = btn.getAttribute('data-issue-id');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<div class="spinner"></div>';
      btn.disabled = true;
      try {
        await claimJob(issueId, user.id, user.name);
        showNotification('Job claimed successfully!', 'success');
        currentTab = 'assigned';
        renderWorkerDashboard();
      } catch (err) {
        showNotification('Error claiming job.', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  });
}
