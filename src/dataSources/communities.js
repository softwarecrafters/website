import communities from "../../communities.json";

const dataSource = {
  type: "geojson",
  cluster: true,
  data: {
    type: "FeatureCollection",
    features: communities.map(community => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: community.location.coordinates
      },
      properties: {
        url: community.url,
        name: community.name
      }
    }))
  }
};

export default dataSource;
