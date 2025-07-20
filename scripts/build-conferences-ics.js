const path = require('path');
const fs = require('fs');
const ics = require('ics');

const conferencesDir = path.resolve(__dirname, '../conferences/');
const conferenceFiles = fs
  .readdirSync(conferencesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(conferencesDir, file));

// validate

// write to conferences.json
const conferences = conferenceFiles
  .map((file) => {
    return JSON.parse(fs.readFileSync(file).toString());
  })
  .filter((conference) => conference['next-date'] != null);

const { error, value } = ics.createEvents(
  conferences.map((conference) => {
    const start = conference['next-date']['start'].split(/-/).map(Number);
    const end = conference['next-date']['end'].split(/-/).map(Number);

    if (conference['next-date']['start'] === conference['next-date']['end']) {
      // Yeah, that's how ICS works.
      end[2]++;
    }

    return {
      title: conference.name,
      description: conference.url,
      url: conference.url,
      start,
      end,
      geo: {
        lat: conference.location.coordinates.lat,
        lon: conference.location.coordinates.lng,
      },
    };
  })
);

if (error) {
  console.error(error);
  process.exit(1);
}

let lines = value.split('\r\n');

const withCalendarInfos = [
  ...lines.slice(0, 3),
  'X-WR-CALNAME:Software Crafting Conferences',
  'X-WR-CALDESC:A list of upcoming Software Crafting conferences worldwide, sourced from www.softwarecrafters.org',
  ...lines.slice(3),
].join('\r\n');

fs.writeFileSync(
  path.resolve(__dirname, '../conferences.ics'),
  withCalendarInfos
);
