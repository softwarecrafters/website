import initModals from './modals.js';
import initSidenav from './sidenav.js';
import './style.scss';

const setMapStatus = (message, type = 'info') => {
  const statusEl = document.getElementById('map-status');
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.classList.remove('map-status--error');
  if (type === 'error') {
    statusEl.classList.add('map-status--error');
  }
  statusEl.hidden = !message;
};

const loadMap = async () => {
  setMapStatus('Loading map...');

  try {
    const { default: initMap } = await import('./map.js');
    initMap();
  } catch (error) {
    console.error('Failed to load map module', error);
    setMapStatus(
      'Unable to load the interactive map right now. Please refresh and try again.',
      'error'
    );
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initSidenav();
  initModals();

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loadMap();
    });
  } else {
    setTimeout(() => {
      loadMap();
    }, 0);
  }
});
