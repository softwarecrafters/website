'use strict';

var communities = [{
  "name": "Software Craftsmanship Berlin",
  "url": "https://www.meetup.com/Software-Craftsmanship-Berlin/",
  "location": {
    "city": "Berlin, Germany",
    "coordinates": [13.391765857937543, 52.518358457921096]
  }
}, {
  "name": "Cambridge Software Crafters",
  "url": "https://www.meetup.com/Cambridge-Software-Crafters/",
  "location": {
    "city": "Cambridge, United Kingdom",
    "coordinates": [0.0849679, 52.1988895]
  }
}, {
  "name": "Softwerkskammer Hamburg",
  "url": "https://www.softwerkskammer.org/groups/hamburg",
  "location": {
    "city": "Hamburg, Germany",
    "coordinates": [10.000807192206253, 53.5521494878235]
  }
}, {
  "name": "London Software Craftsmanship",
  "url": "https://www.meetup.com/london-software-craftsmanship/",
  "location": {
    "city": "London, United Kingdom",
    "coordinates": [-0.12769666311382366, 51.50730924351245]
  }
}, {
  "name": "Softwerkskammer Münster, Osnabrück & Bielefeld",
  "url": "https://www.softwerkskammer.org/groups/socramob",
  "location": {
    "city": "Niedersachsen/NRW, Germany",
    "coordinates": [8.02097649761589, 52.16992136590494]
  }
}, {
  "name": "Softwerkskammer München",
  "url": "https://www.meetup.com/Software-Craftsmanship-Meetup-Softwerkskammer-Munchen/",
  "location": {
    "city": "München, Germany",
    "coordinates": [11.575506762468535, 48.13721093113753]
  }
}];

var RED = "#CA4C4C";
var fetchP = function fetchP(url) {
  return new Promise(function (resolve) {
    var cbName = "cb_" + (Math.random() * 10000000 | 0);
    window[cbName] = resolve;
    var script = document.createElement('script');
    script.src = "" + url + cbName;
    document.body.appendChild(script);
  });
};

var clusterLayer = {
  id: "clusters",
  type: "circle",
  source: "communities",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": RED,
    "circle-radius": 15
  }
};

var clusterCountLayer = {
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

var unclusteredCommunitiesLayer = {
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

var unclusteredCommunitiesPointLayer = {
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

(function () {
  function run() {
    mapboxgl.accessToken = "pk.eyJ1IjoicnJhZGN6ZXdza2kiLCJhIjoiY2o3OWg4ZHV0MDFrdjM3b2FvcXFqdmtidiJ9.oULZ0ljtFZqMHFDbyvkwVQ";

    var map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/rradczewski/cj79d81fz81sc2qtk1i1y4hqv",
      center: [13.2846504, 52.5069704],
      zoom: 3
    });

    map.addControl(new mapboxgl.GeolocateControl({
      trackUserLocation: false,
      showUserLocation: false,
      fitBoundsOptions: { maxZoom: 7 }
    }));

    map.on("load", function () {
      var dataSource = {
        type: "geojson",
        cluster: true,
        data: {
          type: "FeatureCollection",
          features: communities.map(function (community) {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: community.location.coordinates
              },
              properties: {
                url: community.url,
                name: community.name
              }
            };
          })
        }
      };

      map.addSource("communities", dataSource);
      map.addLayer(clusterLayer);
      map.addLayer(clusterCountLayer);
      map.addLayer(unclusteredCommunitiesPointLayer);
      map.addLayer(unclusteredCommunitiesLayer);

      map.on("click", function (e) {
        console.log(JSON.stringify([e.lngLat.lng, e.lngLat.lat]));
      });

      map.on("click", "clusters", function (e) {
        map.flyTo({
          zoom: map.getZoom() + 2,
          center: e.features[0].geometry.coordinates
        });
      });

      var showPopup = function showPopup(e) {
        map.flyTo({
          zoom: Math.max(map.getZoom(), 8),
          center: e.features[0].geometry.coordinates
        });

        var div = document.createElement('div');
        div.innerHTML = "<a target=\"_blank\" href=\"" + e.features[0].properties.url + "\"><b>" + e.features[0].properties.name + "</b></a>";

        if (e.features[0].properties.url.includes('meetup')) {
          var groupName = /meetup\.com\/([^\/]+)\/?/.exec(e.features[0].properties.url);
          if (typeof groupName[1] === 'string' && groupName[1].length > 0) {
            fetchP("https://api.meetup.com/" + groupName[1] + "?callback=").then(function (result) {
              var nextEvent = result.data.next_event;
              if (!nextEvent) return;

              var eventEl = document.createElement("p");
              eventEl.style.color = 'black';
              eventEl.innerHTML = "Next Event on " + new Date(nextEvent.time).toLocaleDateString() + ": <br/><a href=\"https://www.meetup.com/" + groupName[1] + "/events/" + nextEvent.id + "/\">" + nextEvent.name + "</a>";
              div.appendChild(eventEl);
            });
          }
        }

        new mapboxgl.Popup().setLngLat(e.features[0].geometry.coordinates).setDOMContent(div).addTo(map);
      };
      map.on("click", "unclusteredCommunities-point", showPopup);
      map.on("click", "unclusteredCommunities", showPopup);

      var showPointer = function showPointer() {
        return map.getCanvas().style.cursor = "pointer";
      };
      var hidePointer = function hidePointer() {
        return map.getCanvas().style.cursor = "";
      };

      map.on("mouseenter", "clusters", showPointer);
      map.on("mouseenter", "unclusteredCommunities-point", showPointer);

      map.on("mouseleave", "clusters", hidePointer);
      map.on("mouseleave", "unclusteredCommunities-point", hidePointer);
    });
  }

  document.addEventListener("DOMContentLoaded", run);
})();
