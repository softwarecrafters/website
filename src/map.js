import createPopup from "./createPopup";
import communityDataSource from "./dataSource";

const RED = "#CA4C4C";
const YELLOW = "#E2B145";

const clusterLayer = {
  id: "clusters",
  type: "circle",
  source: "communities",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": RED,
    "circle-radius": 15
  }
};

const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  source: "communities",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12
  }
};

const unclusteredCommunitiesLayer = {
  id: "unclusteredCommunities",
  type: "symbol",
  minzoom: 5,
  source: "communities",
  filter: ["!has", "point_count"],
  layout: {
    "text-field": "{name}",
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-offset": [0, -2.2]
  }
};

const unclusteredCommunitiesPointLayer = {
  id: "unclusteredCommunities-point",
  type: "circle",
  source: "communities",
  filter: ["!has", "point_count"],
  paint: {
    "circle-color": RED,
    "circle-radius": 7,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff"
  }
};

const run = () => {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/rradczewski/cj79d81fz81sc2qtk1i1y4hqv",
    center: [13.2846504, 52.5069704],
    zoom: 3
  });

  map.addControl(
    new mapboxgl.GeolocateControl({
      trackUserLocation: false,
      showUserLocation: false,
      fitBoundsOptions: { maxZoom: 7 }
    })
  );

  map.on("load", () => {
    map.addSource("communities", communityDataSource);
    map.addLayer(clusterLayer);
    map.addLayer(clusterCountLayer);
    map.addLayer(unclusteredCommunitiesPointLayer);
    map.addLayer(unclusteredCommunitiesLayer);

    map.on("click", function(e) {
      console.log(JSON.stringify([e.lngLat.lng, e.lngLat.lat]));
    });

    map.on("click", "clusters", e => {
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
    map.on("click", "unclusteredCommunities-point", showPopup);
    map.on("click", "unclusteredCommunities", showPopup);

    const showPointer = () => (map.getCanvas().style.cursor = "pointer");
    const hidePointer = () => (map.getCanvas().style.cursor = "");

    map.on("mouseenter", "clusters", showPointer);
    map.on("mouseenter", "unclusteredCommunities-point", showPointer);

    map.on("mouseleave", "clusters", hidePointer);
    map.on("mouseleave", "unclusteredCommunities-point", hidePointer);
  });
};

export default run;
