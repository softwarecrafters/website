import initMap from "./map.js";
import './style.scss';

$(document).ready(function() {
  $(".button-collapse").sideNav();
  $(".modal").modal();

  initMap();
});
