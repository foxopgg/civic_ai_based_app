// ============================================
// Simple Client-Side Router
// ============================================

const routes = {};
let currentRoute = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path, data = {}) {
  currentRoute = path;
  window.history.pushState({ path, data }, '', `#${path}`);
  renderRoute(path, data);
}

export function renderRoute(path, data = {}) {
  const handler = routes[path];
  if (handler) {
    handler(data);
  }
}

export function getCurrentRoute() {
  return currentRoute;
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const state = e.state;
  if (state) {
    currentRoute = state.path;
    renderRoute(state.path, state.data);
  }
});
