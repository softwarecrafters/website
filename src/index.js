import initMap from "./map.js";
import './style.css';

$(document).ready(function() {
  $(".button-collapse").sideNav();
  $(".modal").modal();

  initMap();
});
