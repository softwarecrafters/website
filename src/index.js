import initMap from './map.js';
import initModals from './modals.js';
import './style.scss';

$(document).ready(function () {
  $('.button-collapse').sideNav();

  initModals();
  initMap();
});
