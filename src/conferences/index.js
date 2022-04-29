import mapboxgl from "mapbox-gl";
import { BLUE } from "../colors";
import { loadIcons } from "../loadIcons";
import createPopup from "./createPopup";
import conferencesDataSource, { nextConferences } from "./dataSource";

const clusterLayer = {
  id: "conference-clusters",
  type: "circle",
  source: "conferences",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": BLUE,
    "circle-radius": 15
  }
};

const clusterCountLayer = {
  id: "conference-cluster-count",
  type: "symbol",
  source: "conferences",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12
  }
};

const unclusteredConferencesLayer = {
  id: "unclustered-conferences",
  type: "symbol",
  minzoom: 5,
  source: "conferences",
  filter: ["!has", "point_count"],
  layout: {
    "text-field": "{name}",
    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
    "text-offset": [0, 1],
    "text-ignore-placement": true,
    "text-allow-overlap": true,
    "text-anchor": "top",
    "icon-ignore-placement": true,
    "icon-allow-overlap": true,
    "icon-image": "{id}",
    "icon-anchor": "bottom",
    "icon-offset": [0, -15]
  }
};

const unclusteredConferencesPointLayer = {
  id: "unclustered-conferences-point",
  type: "circle",
  source: "conferences",
  filter: ["!has", "point_count"],
  paint: {
    "circle-color": BLUE,
    "circle-radius": 7,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#fff"
  }
};

const updateLocation = conference =>
  window.history.pushState(
    {},
    document.title,
    window.location.pathname +
      window.location.search +
      "#" +
      conference.properties.id
  );

const showPopup = (conference, map) => {
  const popup = createPopup(conference);

  new mapboxgl.Popup()
    .setLngLat(conference.geometry.coordinates)
    .setDOMContent(popup)
    .addTo(map);
};

const flyTo = (conference, map) => {
  map.flyTo({
    zoom: Math.max(map.getZoom(), 8),
    center: conference.geometry.coordinates
  });
  updateLocation(conference);
  showPopup(conference, map);
};

const updateConferencesList = map => {
  const createElement = conference => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.innerText = conference.properties.name;
    link.href = `#${conference.properties.id}`;
    link.addEventListener("click", e => {
      e.preventDefault();
      flyTo(conference, map);
    });
    li.appendChild(link);
    li.append(` (${conference.properties.start})`);
    return li;
  };

  const list = document.querySelector("#conferences-list");
  const nextFive = nextConferences.slice(0, 5);

  nextFive.map(createElement).forEach(li => list.appendChild(li));

  document
    .querySelector("a#conferences-list-all")
    .addEventListener("click", e => {
      e.preventDefault();
      e.target.remove();
      list.innerHTML = "";
      nextConferences.map(createElement).forEach(li => list.appendChild(li));
    });
};

export default async (map, geocoder) => {
  await loadIcons(map, conferencesDataSource);

  map.addSource("conferences", conferencesDataSource);
  map.addLayer(clusterLayer);
  map.addLayer(clusterCountLayer);
  map.addLayer(unclusteredConferencesPointLayer);
  map.addLayer(unclusteredConferencesLayer);

  map.on("click", "conference-clusters", e => {
    map.flyTo({
      zoom: map.getZoom() + 2,
      center: e.features[0].geometry.coordinates
    });
  });

  map.on("click", e => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [
        "unclustered-conferences",
        "unclustered-conferences-point"
      ]
    });

    if (
      features.length === 1 ||
      (features.length === 2 &&
        features[0].properties.id === features[1].properties.id)
    ) {
      flyTo(features[0], map);
    }
  });

  const showPointer = () => (map.getCanvas().style.cursor = "pointer");
  const hidePointer = () => (map.getCanvas().style.cursor = "");

  map.on("mouseenter", "conference-clusters", showPointer);
  map.on("mouseenter", "unclustered-conferences-point", showPointer);

  map.on("mouseleave", "conference-clusters", hidePointer);
  map.on("mouseleave", "unclustered-conferences-point", hidePointer);

  geocoder.on("result", ({ result }) => {
    const conference = conferencesDataSource.data.features.find(
      feature => feature.properties.id === result.id
    );
    if (conference) {
      updateLocation(conference);
      showPopup(conference, map);
    }
  });

  updateConferencesList(map);
  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    const conference = conferencesDataSource.data.features.find(
      feature => feature.properties.id === id
    );
    if (conference) {
      flyTo(conference, map);
    }
  }
};
