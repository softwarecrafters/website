import toGeoJSON from "@mapbox/togeojson";

const loadSignatures = async map => {
  const body = await fetch(
    "http://manifesto.softwarecraftsmanship.org/map"
  ).then(response => response.text());
  const node = new DOMParser().parseFromString(body, "text/xml");

  map.addSource("signatures", {
    type: "geojson",
    data: toGeoJSON.kml(node)
  });

  map.addLayer({
    id: "signatures",
    type: "circle",
    source: "signatures",
    paint: {
      "circle-color": "#E2B145",
      "circle-radius": 2
    }
  }, 'clusters');
};

export default loadSignatures;
