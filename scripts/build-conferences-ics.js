const glob = require("glob");
const path = require("path");
const fs = require("fs");
const ics = require("ics");

const conferenceFiles = glob.sync(
  path.resolve(__dirname, "../conferences/") + "/*.json"
);

// validate

// write to conferences.json
const conferences = conferenceFiles
  .map(file => {
    return JSON.parse(fs.readFileSync(file).toString());
  })
  .filter(conference => conference["next-date"] != null);

const { error, value } = ics.createEvents(
  conferences.map(conference => {
    const start = conference["next-date"]["start"].split(/-/).map(Number);
    const end = conference["next-date"]["end"].split(/-/).map(Number);

    if(conference["next-date"]["start"] === conference["next-date"]["end"]) {
      // Yeah, that's how ICS works.
      end[2]++;
    }

    const geo = {
      lat: conference.location.coordinates[1],
      lon: conference.location.coordinates[0]
    }

    return {
      title: conference.name,
      description: conference.url,
      url: conference.url,
      start,
      end,
      geo,
    };
  })
);

if (error) {
  console.error(error);
  process.exit(1);
}

let lines = value.split("\r\n");

const withCalendarInfos = [
  ...lines.slice(0, 3),
  "X-WR-CALNAME:Software Crafting Conferences",
  "X-WR-CALDESC:A list of upcoming Software Crafting conferences worldwide, sourced from www.softwarecrafters.org",
  ...lines.slice(3)
].join("\r\n");


fs.writeFileSync(
  path.resolve(__dirname, '../conferences.ics'),
  withCalendarInfos
);
