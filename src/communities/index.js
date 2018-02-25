import mapboxgl from 'mapbox-gl';
import { RED, YELLOW } from '../colors';
import createPopup from './createPopup';
import communitiesDataSource from './dataSource';

const clusterLayer = {
  id: 'community-clusters',
  type: 'circle',
  source: 'communities',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': RED,
    'circle-radius': 15
  }
};

const clusterCountLayer = {
  id: 'community-cluster-count',
  type: 'symbol',
  source: 'communities',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
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
    'text-offset': [0, -2.2]
  }
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
    'circle-stroke-color': '#fff'
  }
};

export default map => {
  map.addSource('communities', communitiesDataSource);
  map.addLayer(clusterLayer);
  map.addLayer(clusterCountLayer);
  map.addLayer(unclusteredCommunitiesPointLayer);
  map.addLayer(unclusteredCommunitiesLayer);

  map.on('click', 'community-clusters', e => {
    map.flyTo({
      zoom: map.getZoom() + 2,
      center: e.features[0].geometry.coordinates
    });
  });

  const showPopup = e => {
    const community = e.features[0];
    map.flyTo({
      zoom: Math.max(map.getZoom(), 8),
      center: community.geometry.coordinates
    });

    const popup = createPopup(community);

    new mapboxgl.Popup()
      .setLngLat(community.geometry.coordinates)
      .setDOMContent(popup)
      .addTo(map);
  };
  map.on('click', 'unclustered-communities-point', showPopup);
  map.on('click', 'unclustered-communities', showPopup);

  const showPointer = () => (map.getCanvas().style.cursor = 'pointer');
  const hidePointer = () => (map.getCanvas().style.cursor = '');

  map.on('mouseenter', 'community-clusters', showPointer);
  map.on('mouseenter', 'unclustered-communities-point', showPointer);

  map.on('mouseleave', 'community-clusters', hidePointer);
  map.on('mouseleave', 'unclustered-communities-point', hidePointer);
};
