import 'regenerator-runtime/runtime';
import mapboxgl from 'mapbox-gl';
import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';
import 'mapbox-gl/dist/mapbox-gl.css';

import configureCommunities from './communities';
import configureConferences from './conferences';
import createCraftersGeocoder from './craftersGeocoder';

import randomCommunityCoordinates from './communities/randomCommunity';

mapboxgl.accessToken =
  'pk.eyJ1IjoicnJhZGN6ZXdza2kiLCJhIjoiY2o3OWg4ZHV0MDFrdjM3b2FvcXFqdmtidiJ9.oULZ0ljtFZqMHFDbyvkwVQ';
mapboxgl.workerClass = MapboxWorker;

const DEFAULT_STYLE = 'mapbox://styles/rradczewski/cjex2e3sa03hc2sqvkct0qkr6';
const STYLE_FALLBACK_TIMEOUT_MS = 5000;
const INITIAL_ZOOM = 2;

const GEOLOCATE_CONTROL_OPTIONS = {
  trackUserLocation: false,
  showUserLocation: false,
  fitBoundsOptions: {
    maxZoom: 7,
  },
};

const FALLBACK_STYLE = {
  version: 8,
  name: 'fallback-background',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#e8eef2',
      },
    },
  ],
};

const addClickDebugLogger = map => {
  map.on('click', event => {
    console.log(JSON.stringify({ lat: event.lngLat.lat, lng: event.lngLat.lng }));
  });
};

const configureFeature = async (name, configureFn, map, geocoder) => {
  try {
    await configureFn(map, geocoder);
  } catch (err) {
    console.error(`Failed to configure ${name}`, err?.stack || err);
  }
};

const configureMapFeatures = async map => {
  const geocoder = createCraftersGeocoder();
  map.addControl(geocoder, 'top-left');

  await configureFeature('communities', configureCommunities, map, geocoder);
  await configureFeature('conferences', configureConferences, map, geocoder);

  addClickDebugLogger(map);
};

const createMap = () =>
  new mapboxgl.Map({
    container: 'map',
    style: DEFAULT_STYLE,
    center: randomCommunityCoordinates(),
    zoom: INITIAL_ZOOM,
  });

const addGeolocateControl = map => {
  map.addControl(new mapboxgl.GeolocateControl(GEOLOCATE_CONTROL_OPTIONS), 'top-left');
};

const setupStyleLoading = (map, onReady) => {
  let isReady = false;

  const readyOnce = async () => {
    if (isReady) {
      return;
    }
    isReady = true;
    clearTimeout(fallbackTimer);
    await onReady();
  };

  const fallbackTimer = setTimeout(() => {
    if (isReady) {
      return;
    }
    console.warn('Map style load timed out, switching to local fallback style');
    map.setStyle(FALLBACK_STYLE);
  }, STYLE_FALLBACK_TIMEOUT_MS);

  map.on('style.load', readyOnce);
};

const run = () => {
  const map = createMap();
  addGeolocateControl(map);
  setupStyleLoading(map, () => configureMapFeatures(map));
};

export default run;
