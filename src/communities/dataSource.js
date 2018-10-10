import communities from "../../communities.json";
import slugify from 'slugify';

const dataSource = {
  type: "geojson",
  cluster: true,
  data: {
    type: "FeatureCollection",
    features: communities.map((community, i) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: community.location.coordinates
      },
      properties: {
        id: slugify(`community-${i}-${community.name}`).toLowerCase(),
        url: community.url,
        name: community.name,
        icon: community.icon
      }
    }))
  }
};

export default dataSource;
