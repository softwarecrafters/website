import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import configureCommunities from './communities';
import configureConferences from './conferences';

import randomCommunityCoordinates from './communities/randomCommunity';

mapboxgl.accessToken =
  'pk.eyJ1IjoicnJhZGN6ZXdza2kiLCJhIjoiY2o3OWg4ZHV0MDFrdjM3b2FvcXFqdmtidiJ9.oULZ0ljtFZqMHFDbyvkwVQ';



const run = () => {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rradczewski/cj79d81fz81sc2qtk1i1y4hqv',
    center: randomCommunityCoordinates(),
    zoom: 2
  });

  map.addControl(
    new mapboxgl.GeolocateControl({
      trackUserLocation: false,
      showUserLocation: false,
      fitBoundsOptions: { maxZoom: 7 }
    })
  );
  map.addControl(new MapboxGeocoder({
      accessToken: mapboxgl.accessToken
  }), 'top-left');

  map.on('load', () => {
    configureCommunities(map);
    configureConferences(map);

    map.on('click', function(e) {
      console.log(JSON.stringify([e.lngLat.lng, e.lngLat.lat]));
    });
  });
};

export default run;
