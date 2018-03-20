import conferences from '../../conferences.json';
import slugify from 'slugify';
import jsJoda from 'js-joda';
const { LocalDate, ChronoUnit } = jsJoda;

const dataSource = {
  type: 'geojson',
  cluster: true,
  data: {
    type: 'FeatureCollection',
    features: conferences.map((conference, i) => {
      const props = {
        id: slugify(`conference-${i}-${conference.name}`).toLowerCase(),
        url: conference.url,
        name: conference.name,
        coc: conference['code-of-conduct']
      };

      if (conference['next-date']) {
        props.start = conference['next-date'].start;
        props.end = conference['next-date'].end;
        props.singleDay =
          conference['next-date'].start === conference['next-date'].end;

        const parsedStart = LocalDate.parse(props.start);
        const parsedEnd = LocalDate.parse(props.end);
        props.isUpcoming = parsedStart.isAfter(LocalDate.now());
        props.daysUntil = LocalDate.now().until(parsedStart, ChronoUnit.DAYS);
      }

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: conference.location.coordinates
        },
        properties: props
      };
    })
  }
};

export const nextConferences = dataSource.data.features
  .filter(feature => feature.properties.isUpcoming)
  .sort((a, b) => a.properties.daysUntil-b.properties.daysUntil)

export default dataSource;
