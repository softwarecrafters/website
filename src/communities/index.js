import mapboxgl from 'mapbox-gl';
import { RED } from '../colors';
import { loadIcons } from '../loadIcons';
import createPopup from './createPopup';
import communitiesDataSource from './dataSource';

const clusterLayer = {
  id: 'community-clusters',
  type: 'circle',
  source: 'communities',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': RED,
    'circle-radius': 15,
  },
};

const clusterCountLayer = {
  id: 'community-cluster-count',
  type: 'symbol',
  source: 'communities',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
};

const unclusteredCommunitiesLayer = {
  id: 'unclustered-communities',
  type: 'symbol',
  minzoom: 5,
  source: 'communities',
  filter: ['!has', 'point_count'],
  layout: {
    'text-field': '{name}',
    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    'text-offset': [0, 1],
    'text-anchor': 'top',
    'text-ignore-placement': true,
    'text-allow-overlap': true,
    'icon-ignore-placement': true,
    'icon-image': '{id}',
    'icon-allow-overlap': true,
    'icon-anchor': 'bottom',
    'icon-offset': [0, -15],
  },
};

const unclusteredCommunitiesPointLayer = {
  id: 'unclustered-communities-point',
  type: 'circle',
  source: 'communities',
  filter: ['!has', 'point_count'],
  paint: {
    'circle-color': RED,
    'circle-radius': 7,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
};

const SOURCE_ID = 'communities';
const CLUSTER_LAYER_ID = 'community-clusters';
const UNCLUSTERED_LAYER_IDS = ['unclustered-communities', 'unclustered-communities-point'];

const updateLocation = community =>
  window.history.pushState(
    {},
    document.title,
    window.location.pathname + window.location.search + '#' + community.properties.id
  );

const showPopup = (community, map) => {
  const popup = createPopup(community);

  new mapboxgl.Popup().setLngLat(community.geometry.coordinates).setDOMContent(popup).addTo(map);
};

const flyTo = (community, map) => {
  map.flyTo({
    zoom: Math.max(map.getZoom(), 8),
    center: community.geometry.coordinates,
  });
  updateLocation(community);
  showPopup(community, map);
};

const findCommunityById = id =>
  communitiesDataSource.data.features.find(feature => feature.properties.id === id);

const addMapLayers = map => {
  map.addSource(SOURCE_ID, communitiesDataSource);
  [
    clusterLayer,
    clusterCountLayer,
    unclusteredCommunitiesPointLayer,
    unclusteredCommunitiesLayer,
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

const isSingleCommunityResult = features =>
  features.length === 1 ||
  (features.length === 2 && features[0].properties.id === features[1].properties.id);

const bindUnclusteredClick = map => {
  map.on('click', event => {
    const features = map.queryRenderedFeatures(event.point, {
      layers: UNCLUSTERED_LAYER_IDS,
    });
    if (isSingleCommunityResult(features)) {
      flyTo(features[0], map);
    }
  });
};

const bindPointerCursor = map => {
  const setPointerCursor = () => (map.getCanvas().style.cursor = 'pointer');
  const resetPointerCursor = () => (map.getCanvas().style.cursor = '');

  map.on('mouseenter', CLUSTER_LAYER_ID, setPointerCursor);
  map.on('mouseenter', 'unclustered-communities-point', setPointerCursor);
  map.on('mouseleave', CLUSTER_LAYER_ID, resetPointerCursor);
  map.on('mouseleave', 'unclustered-communities-point', resetPointerCursor);
};

const bindGeocoderResult = (map, geocoder) => {
  geocoder.on('result', ({ result }) => {
    const community = findCommunityById(result.id);
    if (!community) {
      return;
    }

    updateLocation(community);
    showPopup(community, map);
  });
};

const flyToCommunityInHash = map => {
  const idFromHash = window.location.hash.slice(1);
  if (!idFromHash) {
    return;
  }

  const community = findCommunityById(idFromHash);
  if (community) {
    flyTo(community, map);
  }
};

export default async (map, geocoder) => {
  await loadIcons(map, communitiesDataSource);

  addMapLayers(map);
  bindClusterClick(map);
  bindUnclusteredClick(map);
  bindPointerCursor(map);
  bindGeocoderResult(map, geocoder);
  flyToCommunityInHash(map);
};
