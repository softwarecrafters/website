const path = require('path');
const fs = require('fs');
const ics = require('ics');
const { listJsonFiles, readJson } = require('./jsonFiles');

const conferencesDir = path.resolve(__dirname, '../conferences');
const conferenceFiles = listJsonFiles(conferencesDir);

const toDateParts = value => value.split(/-/).map(Number);

const nextDay = date => {
  const tomorrow = new Date(date.getTime() + 1000 * 60 * 60 * 24);
  return tomorrow.toISOString().substring(0, 10);
};

const buildEventDateRange = conference => {
  const startDate = conference['next-date'].start;
  const endDate = conference['next-date'].end;

  const start = toDateParts(startDate);
  const end = toDateParts(startDate === endDate ? nextDay(new Date(endDate)) : endDate);

  return { start, end };
};

const createEvent = conference => {
  const { start, end } = buildEventDateRange(conference);

  return {
    title: conference.name,
    description: conference.url,
    url: conference.url,
    start,
    end,
    geo: conference.location?.coordinates
      ? {
          lat: conference.location.coordinates.lat,
          lon: conference.location.coordinates.lng,
        }
      : {},
  };
};

const withCalendarMetadata = icsValue => {
  const lines = icsValue.split('\r\n');

  return [
    ...lines.slice(0, 3),
    'X-WR-CALNAME:Software Crafting Conferences',
    'X-WR-CALDESC:A list of upcoming Software Crafting conferences worldwide, sourced from www.softwarecrafters.org',
    ...lines.slice(3),
  ].join('\r\n');
};

// validate

// write to conferences.json
const conferences = conferenceFiles
  .map(readJson)
  .filter(conference => conference['next-date'] != null);

const { error, value } = ics.createEvents(conferences.map(createEvent));

if (error) {
  console.error(error);
  process.exit(1);
}

fs.writeFileSync(path.resolve(__dirname, '../conferences.ics'), withCalendarMetadata(value));
