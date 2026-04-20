import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { getIssueById, getUser, updateWorkerTask, uploadProofImage } from '../data/mockData.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { showNotification } from '../components/notification.js';
import { icons } from '../utils/icons.js';

let beforeFile = null;
let afterFile = null;
let currentCoords = null;

export async function renderWorkerTask(data = {}) {
  const app = document.getElementById('app');
  const user = getUser();
  const issueId = data.issueId;

  if (!user || user.role !== 'worker' || !issueId) {
    navigate('worker-dashboard');
    return;
  }

  // Loading
  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in" style="text-align:center;padding-top:100px">
      <div class="spinner-dark" style="margin:0 auto;width:32px;height:32px"></div>
    </div>
  `;
  attachNavListeners();

  const issue = await getIssueById(issueId);
  if (!issue || (issue.assigned_worker_id !== user.id && issue.assigned_worker !== user.name)) {
    navigate('worker-dashboard');
    return;
  }

  beforeFile = null;
  afterFile = null;
  currentCoords = null;
  
  // Attempt to grab live geotag
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        (err) => console.log('Geolocation disabled or failed')
    );
  }

  const sevClass = (issue.severity || 'low').toLowerCase();
  const statusBadgeClass = issue.status === 'Completed' ? 'completed' : 'progress';

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <button class="back-btn" id="btn-back-dashboard">
        ${icons.arrowLeft} Back to Assignments
      </button>

      <div class="task-management-card">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-bottom: 16px">Fix Assignment Workspace</h2>

        <!-- Task Summary -->
        <div class="task-header" style="margin-bottom: 24px">
           <div class="task-details" style="width: 100%">
             <h3>${issue.issue_type}</h3>
             <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px">${issue.description || ''}</p>
             <div class="task-meta">
               <span class="badge badge-${sevClass}">${issue.severity} Severity</span>
               <span class="badge badge-${statusBadgeClass}">${issue.status}</span>
             </div>
           </div>
        </div>

        <div class="location-card" style="margin-bottom: 24px">
           <div class="location-icon">${icons.location}</div>
           <div class="location-info">
             <h4>${issue.location || '---'}</h4>
           </div>
        </div>

        <!-- Before & After Pictures Area -->
        <h4 class="task-section-title">Visual Evidence (Geotagged)</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div class="upload-proof" id="upload-before" style="flex-direction: column; cursor: pointer;">
                ${issue.before_image_url 
                    ? `<img src="${issue.before_image_url}" alt="Before" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />` 
                    : `<div style="text-align:center;">${icons.camera}<p style="font-size:0.8rem; margin-top:8px">Upload Before</p></div>`
                }
            </div>
            
            <div class="upload-proof" id="upload-after" style="flex-direction: column; cursor: pointer;">
                ${issue.after_image_url 
                    ? `<img src="${issue.after_image_url}" alt="After" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />` 
                    : `<div style="text-align:center;">${icons.camera}<p style="font-size:0.8rem; margin-top:8px">Upload After</p></div>`
                }
            </div>
        </div>
        
        <!-- Hidden file inputs -->
        <input type="file" accept="image/*" capture="environment" id="input-before" style="display: none" />
        <input type="file" accept="image/*" capture="environment" id="input-after" style="display: none" />

        ${issue.worker_action_lat ? `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; margin-bottom: 24px;">Action logged at ${issue.worker_action_lat.toFixed(4)}, ${issue.worker_action_lng.toFixed(4)}</div>` : ''}

        <!-- Status Overrides & Save -->
        <div class="task-section">
            <h4 class="task-section-title">Finalize Work</h4>
            <div class="status-buttons" style="margin-bottom: 16px;">
                <button class="status-btn ${issue.status === 'In Progress' ? 'active-progress' : ''}" data-status="In Progress" id="status-in-progress">In Progress</button>
                <button class="status-btn ${issue.status === 'Completed' ? 'active-completed' : ''}" data-status="Completed" id="status-completed">Completed</button>
            </div>
        </div>

        <button class="btn btn-primary btn-lg" style="width: 100%" id="btn-submit-work">Update Assignment</button>
      </div>
    </div>
  `;

  attachNavListeners();
  attachWorkerTaskListeners(issue);
}

function attachWorkerTaskListeners(issue) {
    let selectedStatus = issue.status;

    document.getElementById('btn-back-dashboard')?.addEventListener('click', () => navigate('worker-dashboard'));

    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.status-btn').forEach(b => {
            b.classList.remove('active-progress', 'active-completed');
          });
          const status = btn.getAttribute('data-status');
          selectedStatus = status;
          if (status === 'In Progress') btn.classList.add('active-progress');
          if (status === 'Completed') btn.classList.add('active-completed');
        });
    });

    const upBefore = document.getElementById('upload-before');
    const inputBefore = document.getElementById('input-before');
    upBefore?.addEventListener('click', () => inputBefore?.click());
    
    inputBefore?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            beforeFile = file;
            const fr = new FileReader();
            fr.onload = (ev) => {
                upBefore.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
            };
            fr.readAsDataURL(file);
        }
    });

    const upAfter = document.getElementById('upload-after');
    const inputAfter = document.getElementById('input-after');
    upAfter?.addEventListener('click', () => inputAfter?.click());
    
    inputAfter?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            afterFile = file;
            const fr = new FileReader();
            fr.onload = (ev) => {
                upAfter.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
            };
            fr.readAsDataURL(file);
        }
    });

    const btnSubmit = document.getElementById('btn-submit-work');
    btnSubmit?.addEventListener('click', async () => {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<div class="spinner"></div> Processing...`;

        try {
            const updates = { status: selectedStatus };

            if (selectedStatus === 'Completed') {
                if (!issue.worker_action_lat && currentCoords) {
                    updates.worker_action_lat = currentCoords.lat;
                    updates.worker_action_lng = currentCoords.lng;
                    updates.worker_action_time = new Date().toISOString();
                }
            }

            if (beforeFile) {
                updates.before_image_url = await uploadProofImage(beforeFile);
            }
            if (afterFile) {
                updates.after_image_url = await uploadProofImage(afterFile);
                updates.completion_proof_url = updates.after_image_url; // sync for backwards compatibility
            }

            await updateWorkerTask(issue.id, updates);
            showNotification('Assignment updated securely.', 'success');
            
            setTimeout(() => {
                renderWorkerTask({ issueId: issue.id });
            }, 500);
        } catch (err) {
            console.error(err);
            showNotification('Error updating task.', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = 'Update Assignment';
        }
    });
}
