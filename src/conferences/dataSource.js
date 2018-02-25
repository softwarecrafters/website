import conferences from "../../conferences.json";

const dataSource = {
  type: "geojson",
  cluster: true,
  data: {
    type: "FeatureCollection",
    features: conferences.map(conference => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: conference.location.coordinates
      },
      properties: {
        url: conference.url,
        name: conference.name
      }
    }))
  }
};

export default dataSource;
