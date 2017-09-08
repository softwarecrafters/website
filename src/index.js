import initMap from "./map.js";

$(document).ready(function() {
  /* global mapboxgl */
  mapboxgl.accessToken =
    "pk.eyJ1IjoicnJhZGN6ZXdza2kiLCJhIjoiY2o3OWg4ZHV0MDFrdjM3b2FvcXFqdmtidiJ9.oULZ0ljtFZqMHFDbyvkwVQ";

  $(".button-collapse").sideNav();
  $(".modal").modal();

  initMap();
});
