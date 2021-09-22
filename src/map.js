import "regenerator-runtime/runtime";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import configureCommunities from "./communities";
import configureConferences from "./conferences";
import createCraftersGeocoder from "./craftersGeocoder";

import randomCommunityCoordinates from "./communities/randomCommunity";

mapboxgl.accessToken =
  "pk.eyJ1IjoicnJhZGN6ZXdza2kiLCJhIjoiY2o3OWg4ZHV0MDFrdjM3b2FvcXFqdmtidiJ9.oULZ0ljtFZqMHFDbyvkwVQ";

const run = () => {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/rradczewski/cjex2e3sa03hc2sqvkct0qkr6",
    center: randomCommunityCoordinates(),
    zoom: 2
  });

  map.addControl(
    new mapboxgl.GeolocateControl({
      trackUserLocation: false,
      showUserLocation: false,
      fitBoundsOptions: {
        maxZoom: 7
      }
    }),
    "top-left"
  );

  map.on("load", () => {
    const geocoder = createCraftersGeocoder(map);
    map.addControl(geocoder, "top-left");

    configureCommunities(map, geocoder);
    configureConferences(map, geocoder);

    map.on("click", function(e) {
      console.log(JSON.stringify({lat: e.lngLat.lat, lng: e.lngLat.lng}));
    });

    map.on("click", e => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [
          "unclustered-communities",
          "unclustered-communities-point",
          "unclustered-conferences",
          "unclustered-conferences-point"
        ]
      });

      if (features.length > 1) {
        map.flyTo({
          zoom: map.getZoom() + 2,
          center: features[0].geometry.coordinates
        });
      }
    });
  });
};

export default run;
