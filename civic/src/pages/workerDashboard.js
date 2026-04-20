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
    <div class="page-container fade-in">
      <div class="dashboard-header" style="margin-bottom: 24px;">
         <div class="skeleton" style="width:250px; height:40px; margin-bottom:8px; border-radius:4px"></div>
         <div class="skeleton" style="width:350px; height:20px; border-radius:4px"></div>
      </div>
      <div class="glass-card" style="margin-bottom: 24px; padding: 20px; text-align: center;">
         <div class="skeleton" style="width:120px; height:24px; margin: 0 auto 12px; border-radius:4px"></div>
         <div style="display: flex; gap: 16px; justify-content: center;">
            <div class="skeleton" style="width:120px; height:80px; border-radius:8px"></div>
            <div class="skeleton" style="width:120px; height:80px; border-radius:8px"></div>
            <div class="skeleton" style="width:120px; height:80px; border-radius:8px"></div>
         </div>
      </div>
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
          <p class="page-subtitle" style="color: var(--accent)">Welcome, ${user.name} | ${user.work_type || 'Worker'} Specialist</p>
        </div>
      </div>

      <div class="glass-card" style="margin-bottom: 24px; padding: 20px; text-align: center;">
        <h3 style="margin-bottom: 12px; color: var(--accent)">Quick Stats</h3>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <div style="padding: 12px 24px; background: rgba(33,150,243,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: #2196F3">${unassignedJobs.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Available</p>
            </div>
            <div style="padding: 12px 24px; background: rgba(255,160,0,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: #FFA000">${inProgress.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Active Task</p>
            </div>
            <div style="padding: 12px 24px; background: rgba(34,197,94,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: var(--accent)">${completed.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Completed</p>
            </div>
        </div>
      </div>

      <div class="admin-tabs" style="margin-bottom: 24px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <button class="admin-tab ${currentTab === 'available' ? 'active' : ''}" data-tab="available" style="border-radius: 20px">
          ${icons.alertCircle} Available Jobs <span class="tab-count">${unassignedJobs.length}</span>
        </button>
        <button class="admin-tab ${currentTab === 'assigned' ? 'active' : ''}" data-tab="assigned" style="border-radius: 20px">
          ${icons.clock} Active Tasks <span class="tab-count">${inProgress.length}</span>
        </button>
        <button class="admin-tab ${currentTab === 'completed' ? 'active' : ''}" data-tab="completed" style="border-radius: 20px">
          ${icons.checkCircle} Completed Work <span class="tab-count">${completed.length}</span>
        </button>
      </div>

      <div id="worker-tab-content">
        ${renderTabContent(currentTab, { unassignedJobs, inProgress, completed, user })}
      </div>
    </div>
  `;

  attachNavListeners();
  attachDashboardListeners(user);
}

function renderTabContent(tab, data) {
  if (tab === 'available') {
    return data.unassignedJobs.length === 0 ? `
      <div class="placeholder-card glass-card" style="text-align: center; padding: 40px;">
        ${icons.success}
        <p style="margin-top: 12px; color: var(--text-muted)">No new jobs available for your work type.</p>
      </div>
    ` : `
      <div class="task-grid">
        ${data.unassignedJobs.map(issue => {
          const sevClass = (issue.severity || 'low').toLowerCase();
          return `
          <div class="glass-card fade-in" style="border-left: 4px solid var(--severity-${sevClass})">
              <div class="card-body">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
                      <h3 style="font-size: 1.1rem; color: var(--text-light)">${issue.issue_type}</h3>
                      <span class="badge badge-reported">${issue.status}</span>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      ${issue.description || 'No description provided'}
                  </p>
                  <div style="display:flex; align-items:center; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
                      ${icons.location}
                      <span style="margin-left: 6px;">${issue.location}</span>
                  </div>
                  <button class="btn btn-primary btn-sm btn-claim" data-issue-id="${issue.id}" style="width: 100%; border-radius: 20px;">Claim Job</button>
              </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }
  
  if (tab === 'assigned') {
    return data.inProgress.length === 0 ? `
      <div class="placeholder-card glass-card" style="text-align: center; padding: 40px;">
        ${icons.success}
        <p style="margin-top: 12px; color: var(--text-muted)">No active tasks. Claim a job first!</p>
      </div>
    ` : `
      <div class="task-grid">
        ${data.inProgress.map(issue => {
          const sevClass = (issue.severity || 'low').toLowerCase();
          return `
          <div class="glass-card fade-in" style="cursor: pointer; border-left: 4px solid var(--severity-${sevClass})" onclick="window.location.hash='#worker-task?issueId=${issue.id}'">
              <div class="card-body">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
                      <h3 style="font-size: 1.1rem; color: var(--text-light)">${issue.issue_type}</h3>
                      <span class="badge badge-progress">${issue.status}</span>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      ${issue.description || 'No description provided'}
                  </p>
                  <div style="display:flex; align-items:center; font-size: 0.8rem; color: var(--accent)">
                      ${icons.location}
                      <span style="margin-left: 6px;">${issue.location}</span>
                  </div>
              </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }

  if (tab === 'completed') {
    return data.completed.length === 0 ? `
      <div class="placeholder-card glass-card" style="text-align: center; padding: 40px;">
        ${icons.success}
        <p style="margin-top: 12px; color: var(--text-muted)">No completed work yet.</p>
      </div>
    ` : `
      <div class="task-grid">
        ${data.completed.map(issue => {
          const dateStr = issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Unknown Date';
          return `
          <div class="glass-card fade-in" style="border-left: 4px solid var(--accent)">
              <div class="card-body">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
                      <h3 style="font-size: 1.1rem; color: var(--text-light)">${issue.issue_type}</h3>
                      <span class="badge badge-completed">${issue.status}</span>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      ${issue.description || 'No description provided'}
                  </p>
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.8rem;">
                      <div style="color: var(--text-muted); display:flex; align-items:center">
                          ${icons.location} <span style="margin-left: 4px;">${issue.location}</span>
                      </div>
                      <div style="color: var(--accent); font-weight: 600;">
                          ${dateStr}
                      </div>
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
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      renderWorkerDashboard();
    });
  });

  document.querySelectorAll('.btn-claim').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const issueId = btn.getAttribute('data-issue-id');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<div class="spinner" style="margin: 0 auto; border-color: transparent white white white;"></div>';
      btn.disabled = true;
      try {
        await claimJob(issueId, user.id, user.name);
        showNotification('Task claimed! Moved to Active Tasks.', 'success');
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
