import mapboxgl from "mapbox-gl";
import { RED, YELLOW } from "../colors";
import { loadIcons } from '../loadIcons';
import createPopup from "./createPopup";
import communitiesDataSource from "./dataSource";

const clusterLayer = {
  id: "community-clusters",
  type: "circle",
  source: "communities",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": RED,
    "circle-radius": 15
  }
};

const clusterCountLayer = {
  id: "community-cluster-count",
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
  id: "unclustered-communities",
  type: "symbol",
  minzoom: 5,
  source: "communities",
  filter: ["!has", "point_count"],
  layout: {
    "text-field": "{name}",
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-offset": [0, 1],
    "text-anchor": "top",
    "text-ignore-placement": true,
    "text-allow-overlap": true,
    "icon-ignore-placement": true,
    "icon-image": "{id}",
    "icon-allow-overlap": true,
    "icon-anchor": "bottom",
    "icon-offset": [0, -15]
  }
};

const unclusteredCommunitiesPointLayer = {
  id: "unclustered-communities-point",
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

const updateLocation = community =>
  window.history.pushState(
    {},
    document.title,
    window.location.pathname +
      window.location.search +
      "#" +
      community.properties.id
  );

const showPopup = (community, map) => {
  const popup = createPopup(community);

  new mapboxgl.Popup()
    .setLngLat(community.geometry.coordinates)
    .setDOMContent(popup)
    .addTo(map);
};

const flyTo = (community, map) => {
  map.flyTo({
    zoom: Math.max(map.getZoom(), 8),
    center: community.geometry.coordinates
  });
  updateLocation(community);
  showPopup(community, map);
};

export default async (map, geocoder) => {
  await loadIcons(map, communitiesDataSource);

  map.addSource("communities", communitiesDataSource);
  map.addLayer(clusterLayer);
  map.addLayer(clusterCountLayer);
  map.addLayer(unclusteredCommunitiesPointLayer);
  map.addLayer(unclusteredCommunitiesLayer);

  map.on("click", "community-clusters", e => {
    map.flyTo({
      zoom: map.getZoom() + 2,
      center: e.features[0].geometry.coordinates
    });
  });

  map.on("click", e => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [
        "unclustered-communities",
        "unclustered-communities-point",
        "unclustered-conferences",
        "unclustered-conferences-point"
      ]
    });

    if (
      features.length === 1 &&
      (features[0].layer.id === "unclustered-communities" ||
        features[0].layer.id === "unclustered-communities-point")
    ) {
      flyTo(features[0], map);
    }
  });

  const showPointer = () => (map.getCanvas().style.cursor = "pointer");
  const hidePointer = () => (map.getCanvas().style.cursor = "");

  map.on("mouseenter", "community-clusters", showPointer);
  map.on("mouseenter", "unclustered-communities-point", showPointer);

  map.on("mouseleave", "community-clusters", hidePointer);
  map.on("mouseleave", "unclustered-communities-point", hidePointer);

  geocoder.on("result", ({ result }) => {
    const community = communitiesDataSource.data.features.find(
      feature => feature.properties.id === result.id
    );
    if (community) {
      updateLocation(community);
      showPopup(community, map);
    }
  });

  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    const community = communitiesDataSource.data.features.find(
      feature => feature.properties.id === id
    );
    if (community) {
      flyTo(community, map);
    }
  }
};
