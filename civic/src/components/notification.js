// ============================================
// Notification Service
// ============================================

let notifId = 0;

export function showNotification(message, type = 'success', duration = 3500) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const id = `notif-${++notifId}`;

  const iconMap = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.id = id;
  el.innerHTML = `
    <div class="notification-icon">${iconMap[type]}</div>
    <span>${message}</span>
  `;

  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('notification-exit');
    setTimeout(() => el.remove(), 300);
  }, duration);
}
