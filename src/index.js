import initMap from './map.js';
import initModals from './modals.js';
import initSidenav from './sidenav.js';
import './style.scss';

document.addEventListener('DOMContentLoaded', () => {
  initSidenav();

  initModals();
  initMap();
});
