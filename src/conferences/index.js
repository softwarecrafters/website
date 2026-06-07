import mapboxgl from 'mapbox-gl';
import { BLUE } from '../colors';
import { loadIcons } from '../loadIcons';
import createPopup from './createPopup';
import conferencesDataSource, { nextConferences } from './dataSource';

const clusterLayer = {
  id: 'conference-clusters',
  type: 'circle',
  source: 'conferences',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': BLUE,
    'circle-radius': 15,
  },
};

const clusterCountLayer = {
  id: 'conference-cluster-count',
  type: 'symbol',
  source: 'conferences',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
};

const unclusteredConferencesLayer = {
  id: 'unclustered-conferences',
  type: 'symbol',
  minzoom: 5,
  source: 'conferences',
  filter: ['!has', 'point_count'],
  layout: {
    'text-field': '{name}',
    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    'text-offset': [0, 1],
    'text-ignore-placement': true,
    'text-allow-overlap': true,
    'text-anchor': 'top',
    'icon-ignore-placement': true,
    'icon-allow-overlap': true,
    'icon-image': '{id}',
    'icon-anchor': 'bottom',
    'icon-offset': [0, -15],
  },
};

const unclusteredConferencesPointLayer = {
  id: 'unclustered-conferences-point',
  type: 'circle',
  source: 'conferences',
  filter: ['!has', 'point_count'],
  paint: {
    'circle-color': BLUE,
    'circle-radius': 7,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
};

const SOURCE_ID = 'conferences';
const CLUSTER_LAYER_ID = 'conference-clusters';
const UNCLUSTERED_LAYER_IDS = ['unclustered-conferences', 'unclustered-conferences-point'];
const INITIAL_LIST_SIZE = 5;

const updateLocation = conference =>
  window.history.pushState(
    {},
    document.title,
    window.location.pathname + window.location.search + '#' + conference.properties.id
  );

const showPopup = (conference, map) => {
  const popup = createPopup(conference);

  new mapboxgl.Popup().setLngLat(conference.geometry.coordinates).setDOMContent(popup).addTo(map);
};

const flyTo = (conference, map) => {
  map.flyTo({
    zoom: Math.max(map.getZoom(), 8),
    center: conference.geometry.coordinates,
  });
  updateLocation(conference);
  showPopup(conference, map);
};

const findConferenceById = id =>
  conferencesDataSource.data.features.find(feature => feature.properties.id === id);

const addMapLayers = map => {
  map.addSource(SOURCE_ID, conferencesDataSource);
  [
    clusterLayer,
    clusterCountLayer,
    unclusteredConferencesPointLayer,
    unclusteredConferencesLayer,
  ].forEach(layer => map.addLayer(layer));
};

const bindClusterClick = map => {
  map.on('click', CLUSTER_LAYER_ID, event => {
    map.flyTo({
      zoom: map.getZoom() + 2,
      center: event.features[0].geometry.coordinates,
    });
  });
};

const isSingleConferenceResult = features =>
  features.length === 1 ||
  (features.length === 2 && features[0].properties.id === features[1].properties.id);

const bindUnclusteredClick = map => {
  map.on('click', event => {
    const features = map.queryRenderedFeatures(event.point, {
      layers: UNCLUSTERED_LAYER_IDS,
    });

    if (isSingleConferenceResult(features)) {
      flyTo(features[0], map);
    }
  });
};

const bindPointerCursor = map => {
  const setPointerCursor = () => (map.getCanvas().style.cursor = 'pointer');
  const resetPointerCursor = () => (map.getCanvas().style.cursor = '');

  map.on('mouseenter', CLUSTER_LAYER_ID, setPointerCursor);
  map.on('mouseenter', 'unclustered-conferences-point', setPointerCursor);
  map.on('mouseleave', CLUSTER_LAYER_ID, resetPointerCursor);
  map.on('mouseleave', 'unclustered-conferences-point', resetPointerCursor);
};

const bindGeocoderResult = (map, geocoder) => {
  geocoder.on('result', ({ result }) => {
    const conference = findConferenceById(result.id);
    if (!conference) {
      return;
    }

    updateLocation(conference);
    showPopup(conference, map);
  });
};

const renderConferenceList = (map, list, conferences) => {
  conferences
    .map(conference => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      const date = document.createElement('span');

      link.innerText = conference.properties.name;
      link.href = `#${conference.properties.id}`;
      link.addEventListener('click', event => {
        event.preventDefault();
        flyTo(conference, map);
      });

      date.className = 'conference-date';
      date.textContent = ` (${conference.properties.start})`;

      li.appendChild(link);
      li.appendChild(date);
      return li;
    })
    .forEach(li => list.appendChild(li));
};

const updateConferencesList = map => {
  const list = document.querySelector('#conferences-list');
  const showAllLink = document.querySelector('a#conferences-list-all');

  renderConferenceList(map, list, nextConferences.slice(0, INITIAL_LIST_SIZE));

  showAllLink.addEventListener('click', event => {
    event.preventDefault();
    event.target.remove();
    list.innerHTML = '';
    renderConferenceList(map, list, nextConferences);
  });
};

const flyToConferenceInHash = map => {
  const idFromHash = window.location.hash.slice(1);
  if (!idFromHash) {
    return;
  }

  const conference = findConferenceById(idFromHash);
  if (conference) {
    flyTo(conference, map);
  }
};

export default async (map, geocoder) => {
  await loadIcons(map, conferencesDataSource);

  addMapLayers(map);
  bindClusterClick(map);
  bindUnclusteredClick(map);
  bindPointerCursor(map);
  bindGeocoderResult(map, geocoder);

  updateConferencesList(map);
  flyToConferenceInHash(map);
};
