import mapboxgl from 'mapbox-gl';
import communities from './communities/dataSource';
import conferences from './conferences/dataSource';

export default map => {
  const sources = [communities, conferences].reduce(
    (list, source) => source.data.features.concat(list),
    []
  );

  const craftersGeocoder = query => {
    return sources
      .filter(feature =>
        feature.properties.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(feature => ({
        id: feature.properties.name,
        text: feature.properties.name,
        place_name: feature.properties.name,
        place_type: 'place',
        center: feature.geometry.coordinates
      }));
  };

  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      localGeocoder: craftersGeocoder
    }),
    'top-left'
  );
};
