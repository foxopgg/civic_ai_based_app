import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { getWorkerIssues, getUser } from '../data/mockData.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { icons } from '../utils/icons.js';

export async function renderWorkerDashboard() {
  const app = document.getElementById('app');
  const user = getUser();
  
  if (!user || user.role !== 'worker') {
    navigate('login');
    return;
  }

  // Loading state
  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in" style="text-align:center;padding-top:100px">
      <div class="spinner-dark" style="margin:0 auto;width:32px;height:32px"></div>
    </div>
  `;
  attachNavListeners();

  const issues = await getWorkerIssues(user.name);
  
  const inProgress = issues.filter(i => i.status === 'In Progress' || i.status === 'Assigned');
  const completed = issues.filter(i => i.status === 'Completed');

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <div class="dashboard-header" style="margin-bottom: 24px;">
        <div>
          <h1 class="page-title">Worker Dashboard</h1>
          <p class="page-subtitle">Welcome, ${user.name} | ${issues.length} Total Assignments</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 24px; padding: 20px; text-align: center;">
        <h3 style="margin-bottom: 12px; color: var(--primary)">Quick Stats</h3>
        <div style="display: flex; gap: 16px; justify-content: center;">
            <div style="padding: 12px 24px; background: rgba(255,160,0,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: #FFA000">${inProgress.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Active Tasks</p>
            </div>
            <div style="padding: 12px 24px; background: rgba(76,175,80,0.1); border-radius: 8px;">
                <p style="font-size: 2rem; font-weight: 800; color: #4CAF50">${completed.length}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted)">Completed</p>
            </div>
        </div>
      </div>

      <h2 style="font-size: 1.2rem; margin-bottom: 16px;">Assigned Tasks</h2>
      <div class="task-grid">
        ${issues.length === 0 ? `
          <div class="placeholder-card">
            ${icons.success}
            <p style="margin-top: 12px; color: var(--text-muted)">No active assignments. Great job!</p>
          </div>
        ` : issues.map(issue => {
            const sevClass = (issue.severity || 'low').toLowerCase();
            const statusClass = issue.status === 'Completed' ? 'completed' : 'progress';
            return `
            <div class="card fade-in" style="cursor: pointer; cursor: pointer; border-left: 4px solid var(--severity-${sevClass})" onclick="window.location.hash='#worker-task?issueId=${issue.id}'">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
                        <h3 style="font-size: 1.1rem; color: var(--textDark)">${issue.issue_type}</h3>
                        <span class="badge badge-${statusClass}">${issue.status}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${issue.description}
                    </p>
                    <div style="display:flex; align-items:center; font-size: 0.8rem; color: var(--text-muted)">
                        ${icons.location}
                        <span style="margin-left: 6px;">${issue.location}</span>
                    </div>
                </div>
            </div>`;
        }).join('')}
      </div>
    </div>
  `;

  attachNavListeners();
}
