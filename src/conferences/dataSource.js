import conferences from '../../conferences.json';
import slugify from 'slugify';
import { LocalDate, ChronoUnit } from 'js-joda';

const today = LocalDate.now();

const dataSource = {
  type: 'geojson',
  cluster: true,
  data: {
    type: 'FeatureCollection',
    features: conferences
      .filter(conference => conference.location !== 'virtual')
      .map(conference => {
        const props = {
          id: slugify(`conference-${conference.name}`).toLowerCase(),
          icon: conference.icon,
          url: conference.url,
          name: conference.name,
          coc: conference['code-of-conduct'],
          health: conference['health-policy'],
        };

        if (conference['next-date']) {
          const nextDate = conference['next-date'];
          props.start = nextDate.start;
          props.end = nextDate.end;
          props.singleDay = nextDate.start === nextDate.end;

          const parsedStart = LocalDate.parse(props.start);
          props.isUpcoming = parsedStart.isAfter(today);
          props.daysUntil = today.until(parsedStart, ChronoUnit.DAYS);
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [conference.location.coordinates.lng, conference.location.coordinates.lat],
          },
          properties: props,
        };
      }),
  },
};

export const nextConferences = dataSource.data.features
  .filter(feature => feature.properties.isUpcoming)
  .sort((a, b) => a.properties.daysUntil - b.properties.daysUntil);

export default dataSource;
