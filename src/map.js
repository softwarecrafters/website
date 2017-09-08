import communities from "../communities.json";

const RED = "#CA4C4C";
const YELLOW = "#E2B145";

const fetchP = url =>
  new Promise(resolve => {
    const cbName = `cb_${(Math.random() * 10000000) | 0}`;
    window[cbName] = resolve;
    const script = document.createElement("script");
    script.src = `${url}${cbName}`;
    document.body.appendChild(script);
  });

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

function run() {
  $(".button-collapse").sideNav();
  mapboxgl.accessToken =
    "pk.eyJ1IjoicnJhZGN6ZXdza2kiLCJhIjoiY2o3OWg4ZHV0MDFrdjM3b2FvcXFqdmtidiJ9.oULZ0ljtFZqMHFDbyvkwVQ";

  var map = new mapboxgl.Map({
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

    map.addSource("communities", dataSource);
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
      map.flyTo({
        zoom: Math.max(map.getZoom(), 8),
        center: e.features[0].geometry.coordinates
      });

      const div = document.createElement("div");
      div.innerHTML = `<a target="_blank" href="${e.features[0].properties
        .url}"><b>${e.features[0].properties.name}</b></a>`;

      if (e.features[0].properties.url.includes("meetup")) {
        const groupName = /meetup\.com\/([^\/]+)\/?/.exec(
          e.features[0].properties.url
        );
        if (typeof groupName[1] === "string" && groupName[1].length > 0) {
          fetchP(
            `https://api.meetup.com/${groupName[1]}?callback=`
          ).then(result => {
            const nextEvent = result.data.next_event;
            if (!nextEvent) return;

            const eventEl = document.createElement(`p`);
            eventEl.style.color = "black";
            eventEl.innerHTML = `Next Event on ${new Date(
              nextEvent.time
            ).toLocaleDateString()}: <br/><a href="https://www.meetup.com/${groupName[1]}/events/${nextEvent.id}/">${nextEvent.name}</a>`;
            div.appendChild(eventEl);
          });
        }
      }

      new mapboxgl.Popup()
        .setLngLat(e.features[0].geometry.coordinates)
        .setDOMContent(div)
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
}

export default run;
