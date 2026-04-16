// ============================================
// Admin Dashboard - Supabase powered
// Leaflet.js OpenStreetMap integration with
// real-time Supabase subscriptions
// ============================================

import { t } from '../utils/i18n.js';
import { navigate } from '../utils/router.js';
import { getIssues, getAnalytics, getReportedIssues, getActiveIssues, getCompletedIssues, getIssueTypes, assignWorker, getWorkers, updateIssueStatus } from '../data/mockData.js';
import { renderNavbar, attachNavListeners } from '../components/navbar.js';
import { showNotification } from '../components/notification.js';
import { icons } from '../utils/icons.js';
import { supabase } from '../utils/supabase.js';

let currentTab = 'reports';
let leafletMap = null;
let markersLayer = null;
let realtimeChannel = null;

// Severity-based marker colors
const SEVERITY_COLORS = {
  high: '#E53935',
  medium: '#F9A825',
  low: '#43A047',
};

const SEVERITY_GLOW = {
  high: 'rgba(229, 57, 53, 0.4)',
  medium: 'rgba(249, 168, 37, 0.4)',
  low: 'rgba(67, 160, 71, 0.4)',
};

// Create a custom circle marker icon with severity color
function createSeverityIcon(severity) {
  const sev = (severity || 'low').toLowerCase();
  const color = SEVERITY_COLORS[sev] || SEVERITY_COLORS.low;
  const glow = SEVERITY_GLOW[sev] || SEVERITY_GLOW.low;

  return L.divIcon({
    className: 'leaflet-severity-marker',
    html: `
      <div class="marker-ping" style="background:${glow}"></div>
      <div class="marker-dot" style="background:${color};box-shadow:0 2px 8px ${glow}, 0 0 0 3px white">
        <div class="marker-inner" style="background:rgba(255,255,255,0.3)"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// Build popup HTML for an issue
function buildPopupContent(issue) {
  const sevClass = (issue.severity || 'low').toLowerCase();
  const sevColor = SEVERITY_COLORS[sevClass] || SEVERITY_COLORS.low;
  const statusColors = {
    'Reported': '#1976D2',
    'Assigned': '#F57C00',
    'In Progress': '#FBC02D',
    'Completed': '#2E7D32',
  };
  const statusColor = statusColors[issue.status] || '#888';

  const imageHtml = issue.image_url && !issue.image_url.includes('undefined')
    ? `<img src="${issue.image_url}" alt="${issue.issue_type}" style="width:100%;height:110px;object-fit:cover;border-radius:8px 8px 0 0;margin:-12px -14px 10px -14px;width:calc(100% + 28px);" />`
    : '';

  return `
    <div class="leaflet-popup-custom">
      ${imageHtml}
      <div style="font-weight:700;font-size:0.92rem;color:#1B2E1F;margin-bottom:6px;">${issue.issue_type}</div>
      ${issue.description ? `<p style="font-size:0.8rem;color:#7A9982;margin-bottom:8px;line-height:1.4;">${issue.description.length > 80 ? issue.description.slice(0, 80) + '…' : issue.description}</p>` : ''}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
        <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;color:white;background:${sevColor};">${issue.severity || 'Low'}</span>
        <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.3px;color:white;background:${statusColor};">${issue.status}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;font-size:0.78rem;color:#7A9982;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${issue.location || 'Unknown Location'}
      </div>
      ${issue.assigned_worker ? `<div style="font-size:0.75rem;color:#4A6B52;margin-top:4px;">👷 ${issue.assigned_worker}</div>` : ''}
    </div>
  `;
}

// Add a single marker for an issue to the markers layer
function addMarkerForIssue(issue) {
  if (!markersLayer || !leafletMap) return;

  const lat = issue.location_lat;
  const lng = issue.location_lng;
  if (!lat || !lng) return;

  const marker = L.marker([lat, lng], {
    icon: createSeverityIcon(issue.severity),
  });

  marker.bindPopup(buildPopupContent(issue), {
    maxWidth: 260,
    minWidth: 200,
    className: 'custom-popup',
  });

  marker.issueId = issue.id;
  marker.on('click', () => {
    marker.openPopup();
  });

  markersLayer.addLayer(marker);
  return marker;
}

// Initialize the Leaflet map
function initLeafletMap(issues) {
  // Destroy previous map instance if any
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  const mapContainer = document.getElementById('leaflet-map');
  if (!mapContainer) return;

  // Default center: Chennai, India
  leafletMap = L.map('leaflet-map', {
    center: [13.05, 80.21],
    zoom: 12,
    zoomControl: false,
    attributionControl: true,
  });

  // Add zoom control to bottom-right
  L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap);

  // OpenStreetMap tiles with clean style
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(leafletMap);

  // Create marker cluster group
  markersLayer = L.layerGroup().addTo(leafletMap);

  // Add existing issue markers
  const validIssues = issues.filter(i => i.location_lat && i.location_lng);
  validIssues.forEach(issue => addMarkerForIssue(issue));

  // Fit bounds to markers if we have any
  if (validIssues.length > 0) {
    const bounds = L.latLngBounds(validIssues.map(i => [i.location_lat, i.location_lng]));
    leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }

  // Fix map size after rendering
  setTimeout(() => {
    leafletMap.invalidateSize();
  }, 200);
}

// Subscribe to Supabase realtime changes on the reports table
function subscribeToRealtimeUpdates() {
  // Unsubscribe any existing channel
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  realtimeChannel = supabase
    .channel('admin-reports-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reports',
      },
      (payload) => {
        const newIssue = payload.new;
        console.log('🆕 New report received via realtime:', newIssue);

        // Add marker to map instantly
        if (newIssue.location_lat && newIssue.location_lng) {
          const marker = addMarkerForIssue(newIssue);

          // Animate: fly to new marker and open popup
          if (marker && leafletMap) {
            leafletMap.flyTo([newIssue.location_lat, newIssue.location_lng], 14, {
              duration: 1.2,
            });
            setTimeout(() => marker.openPopup(), 1300);
          }
        }

        // Show notification
        showNotification(
          `New ${newIssue.severity || 'Low'} severity report: ${newIssue.issue_type} at ${newIssue.location || 'Unknown'}`,
          newIssue.severity === 'High' ? 'error' : newIssue.severity === 'Medium' ? 'warning' : 'info'
        );
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'reports',
      },
      (payload) => {
        const updated = payload.new;
        console.log('✏️ Report updated via realtime:', updated);

        // Update the marker on the map
        if (markersLayer && updated.location_lat && updated.location_lng) {
          // Remove old marker
          markersLayer.eachLayer((layer) => {
            if (layer.issueId === updated.id) {
              markersLayer.removeLayer(layer);
            }
          });
          // Add updated marker
          addMarkerForIssue(updated);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Realtime subscription status:', status);
    });
}

// Cleanup realtime subscription (called when navigating away)
export function cleanupAdminRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }
  markersLayer = null;
}

export async function renderAdmin() {
  const app = document.getElementById('app');

  // Cleanup previous instances
  cleanupAdminRealtime();

  // Loading state
  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <div class="page-header">
        <h1 class="page-title">${t('adminTitle')}</h1>
        <p class="page-subtitle">${t('adminSubtitle')}</p>
      </div>
      <div style="text-align:center; padding:60px 0">
        <div class="spinner-dark" style="margin:0 auto;width:32px;height:32px"></div>
        <p style="margin-top:12px;color:var(--text-muted)">${t('loading')}</p>
      </div>
    </div>
  `;
  attachNavListeners();

  // Fetch all data in parallel
  const [analytics, allIssues, reported, wip, completed] = await Promise.all([
    getAnalytics(),
    getIssues(),
    getReportedIssues(),
    getActiveIssues(),
    getCompletedIssues(),
  ]);

  const issueTypes = getIssueTypes();

  app.innerHTML = `
    ${renderNavbar()}
    <div class="page-container fade-in">
      <div class="page-header">
        <h1 class="page-title">${t('adminTitle')}</h1>
        <p class="page-subtitle">${t('adminSubtitle')}</p>
      </div>

      <!-- Analytics Cards -->
      <div class="analytics-row">
        <div class="analytics-card" id="analytics-total">
          <div class="analytics-icon total-icon">
            ${icons.alertCircle}
          </div>
          <div class="analytics-info">
            <span class="analytics-value">${analytics.total}</span>
            <span class="analytics-label">${t('totalIssues')}</span>
          </div>
        </div>
        <div class="analytics-card" id="analytics-resolved">
          <div class="analytics-icon resolved-icon">
            ${icons.checkCircle}
          </div>
          <div class="analytics-info">
            <span class="analytics-value">${analytics.resolved}</span>
            <span class="analytics-label">${t('resolvedIssues')}</span>
          </div>
        </div>
        <div class="analytics-card" id="analytics-pending">
          <div class="analytics-icon pending-icon">
            ${icons.clock}
          </div>
          <div class="analytics-info">
            <span class="analytics-value">${analytics.pending}</span>
            <span class="analytics-label">${t('pendingIssues')}</span>
          </div>
        </div>
      </div>

      <!-- Leaflet Map Card -->
      <div class="admin-map-card" style="margin-bottom:24px" id="map-card">
        <div class="section-header" style="padding:16px 16px 0">
          <h3 class="section-title">${icons.mapPin} ${t('issueMap')}</h3>
          <div class="map-realtime-badge" id="realtime-badge">
            <span class="realtime-dot"></span>
            ${t('liveLabel')}
          </div>
        </div>
        <div id="leaflet-map" class="leaflet-map-container"></div>
        <div class="map-legend-bar">
          <div class="legend-bar-title">${t('mapLegendTitle')}</div>
          <div class="legend-bar-items">
            <div class="legend-bar-item"><span class="legend-bar-dot" style="background:var(--severity-high)"></span>${t('high')}</div>
            <div class="legend-bar-item"><span class="legend-bar-dot" style="background:var(--severity-medium)"></span>${t('medium')}</div>
            <div class="legend-bar-item"><span class="legend-bar-dot" style="background:var(--severity-low)"></span>${t('low')}</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs" id="admin-tabs">
        <button class="admin-tab ${currentTab === 'reports' ? 'active' : ''}" data-tab="reports" id="tab-reports">
          ${icons.report}
          ${t('reportsSection')} <span class="tab-count">${reported.length}</span>
        </button>
        <button class="admin-tab ${currentTab === 'wip' ? 'active' : ''}" data-tab="wip" id="tab-wip">
          ${icons.clock}
          ${t('wipSection')} <span class="tab-count">${wip.length}</span>
        </button>
        <button class="admin-tab ${currentTab === 'completed' ? 'active' : ''}" data-tab="completed" id="tab-completed">
          ${icons.checkCircle}
          ${t('completedSection')} <span class="tab-count">${completed.length}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div id="admin-tab-content">
        ${renderTabContent(currentTab, { reported, wip, completed })}
      </div>
    </div>
  `;

  attachNavListeners();
  attachAdminListeners({ reported, wip, completed });

  // Initialize Leaflet map after DOM is ready
  setTimeout(() => {
    initLeafletMap(allIssues);
    subscribeToRealtimeUpdates();
  }, 100);
}

function renderTabContent(tab, data) {
  if (tab === 'reports') {
    return data.reported.length > 0
      ? data.reported.map((issue, idx) => renderReportCard(issue, idx)).join('')
      : `<div class="card" style="padding:40px;text-align:center;margin-top:16px"><p style="color:var(--text-muted)">${t('noReports')}</p></div>`;
  }
  if (tab === 'wip') {
    return data.wip.length > 0
      ? data.wip.map((issue, idx) => renderWipCard(issue, idx)).join('')
      : `<div class="card" style="padding:40px;text-align:center;margin-top:16px"><p style="color:var(--text-muted)">${t('noWip')}</p></div>`;
  }
  if (tab === 'completed') {
    return data.completed.length > 0
      ? data.completed.map((issue, idx) => renderCompletedAdminCard(issue, idx)).join('')
      : `<div class="card" style="padding:40px;text-align:center;margin-top:16px"><p style="color:var(--text-muted)">${t('noCompleted')}</p></div>`;
  }
  return '';
}

function renderReportCard(issue, idx) {
  const sevClass = (issue.severity || 'low').toLowerCase();
  const sevLabel = issue.severity === 'High' ? t('severityHigh') :
                   issue.severity === 'Medium' ? t('severityMedium') : t('severityLow');
  const hasImage = issue.image_url && !issue.image_url.includes('undefined');

  return `
    <div class="admin-issue-card slide-up" style="animation-delay:${idx*0.05}s" id="admin-card-${issue.id}">
      <div class="admin-issue-image">
        ${hasImage ? `<img src="${issue.image_url}" alt="${issue.issue_type}" loading="lazy" />` : `<div style="background:linear-gradient(135deg,#795548,#8D6E63);width:100%;height:100%;display:flex;align-items:center;justify-content:center"><span style="color:rgba(255,255,255,0.5);font-size:0.65rem;font-weight:600">${issue.issue_type}</span></div>`}
      </div>
      <div class="admin-issue-info">
        <h4>${issue.issue_type}</h4>
        <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:4px">${issue.description || ''}</p>
        <div class="location-text" style="margin-bottom:6px">
          ${icons.location}
          ${issue.location || '---'}
        </div>
        <span class="badge badge-${sevClass}">${sevLabel}</span>
      </div>
      <div class="admin-issue-actions">
        <button class="btn btn-primary btn-sm" data-assign-id="${issue.id}" id="assign-btn-${issue.id}">
          ${t('assignBtn')}
        </button>
      </div>
    </div>
  `;
}

function renderWipCard(issue, idx) {
  const sevClass = (issue.severity || 'low').toLowerCase();
  const hasImage = issue.image_url && !issue.image_url.includes('undefined');

  return `
    <div class="admin-issue-card slide-up wip-card" style="animation-delay:${idx*0.05}s; border-left: 4px solid var(--severity-medium)" id="wip-card-${issue.id}">
      <div class="admin-issue-image">
        ${hasImage ? `<img src="${issue.image_url}" alt="${issue.issue_type}" loading="lazy" />` : `<div style="background:linear-gradient(135deg,#FDD835,#FFA000);width:100%;height:100%;display:flex;align-items:center;justify-content:center"><span style="color:rgba(255,255,255,0.5);font-size:0.65rem;font-weight:600">${issue.issue_type}</span></div>`}
      </div>
      <div class="admin-issue-info">
        <h4>${issue.issue_type}</h4>
        <div class="location-text" style="margin-bottom:4px">${icons.location} ${issue.location || '---'}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px">
          <span class="badge badge-${sevClass === 'high' ? 'high' : sevClass === 'medium' ? 'medium' : 'low'}">${issue.severity}</span>
          <span class="badge badge-progress">${issue.status}</span>
        </div>
        ${issue.estimated_time ? `<p style="font-size:0.78rem;color:var(--severity-medium);font-weight:600">${t('estPrefix')} ${issue.estimated_time}</p>` : ''}
        ${issue.assigned_worker ? `<p style="font-size:0.78rem;color:var(--text-muted)">${t('workerPrefix')} ${issue.assigned_worker}</p>` : ''}
      </div>
      <div class="admin-issue-actions">
        <button class="btn btn-secondary btn-sm" data-manage-id="${issue.id}" id="manage-btn-${issue.id}">
          ${t('manageBtn')}
        </button>
      </div>
    </div>
  `;
}

function renderCompletedAdminCard(issue, idx) {
  const hasImage = issue.image_url && !issue.image_url.includes('undefined');
  const hasProof = issue.completion_proof_url && !issue.completion_proof_url.includes('undefined');

  return `
    <div class="admin-issue-card slide-up completed-admin-card" style="animation-delay:${idx*0.05}s; border-left: 4px solid var(--secondary)" id="completed-admin-${issue.id}">
      <div class="admin-issue-image" style="width:160px">
        <div class="before-after" style="display:grid;grid-template-columns:1fr 1fr;gap:2px;height:100%">
          <div style="position:relative;overflow:hidden">
            ${hasImage ? `<img src="${issue.image_url}" alt="Before" style="width:100%;height:100%;object-fit:cover" loading="lazy" />` : `<div style="background:linear-gradient(135deg,#795548,#8D6E63);height:100%"></div>`}
            <span style="position:absolute;bottom:2px;left:2px;font-size:0.55rem;font-weight:700;background:rgba(229,57,53,0.85);color:white;padding:1px 4px;border-radius:3px">${t('beforeLabel')}</span>
          </div>
          <div style="position:relative;overflow:hidden">
            ${hasProof ? `<img src="${issue.completion_proof_url}" alt="After" style="width:100%;height:100%;object-fit:cover" loading="lazy" />` : `<div style="background:linear-gradient(135deg,#A5D6A7,#81C784);height:100%"></div>`}
            <span style="position:absolute;bottom:2px;left:2px;font-size:0.55rem;font-weight:700;background:rgba(46,125,50,0.85);color:white;padding:1px 4px;border-radius:3px">${t('afterLabel')}</span>
          </div>
        </div>
      </div>
      <div class="admin-issue-info">
        <h4 style="color:var(--secondary)">${issue.issue_type}</h4>
        <div class="location-text">${icons.location} ${issue.location || '---'}</div>
        <div class="completion-proof" style="margin-top:4px">
          ${icons.verified}
          <span>${t('verifiedCompleted')}</span>
        </div>
      </div>
    </div>
  `;
}

function attachAdminListeners(data) {
  // Tab switching
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById('admin-tab-content');
      if (content) {
        content.innerHTML = renderTabContent(currentTab, data);
        attachCardListeners();
      }
    });
  });

  attachCardListeners();
}

function attachCardListeners() {
  // Assign buttons
  document.querySelectorAll('[data-assign-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const issueId = btn.getAttribute('data-assign-id');
      navigate('task', { issueId });
    });
  });

  // Manage buttons
  document.querySelectorAll('[data-manage-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const issueId = btn.getAttribute('data-manage-id');
      navigate('task', { issueId });
    });
  });
}
