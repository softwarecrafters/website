import mapboxgl from 'mapbox-gl';
import communities from './communities/dataSource';
import conferences from './conferences/dataSource';

const allFeatures = [communities, conferences].flatMap(source => source.data.features);

const normalize = value => value.toLowerCase();

const toGeocoderResult = feature => ({
  id: feature.properties.id,
  text: feature.properties.name,
  place_name: feature.properties.name,
  place_type: 'place',
  center: feature.geometry.coordinates,
});

const createLocalGeocoder = features => query => {
  const normalizedQuery = normalize(query);

  return features
    .filter(feature => normalize(feature.properties.name).includes(normalizedQuery))
    .map(toGeocoderResult);
};

export default () => {
  return new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    localGeocoder: createLocalGeocoder(allFeatures),
  });
};
