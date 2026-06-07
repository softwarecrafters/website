const path = require('path');
const fs = require('fs');
const { listJsonFiles, readJson } = require('./jsonFiles');

const conferencesDir = path.resolve(__dirname, '../conferences');
const conferenceFiles = listJsonFiles(conferencesDir);

// validate

// write to conferences.json
const conferences = conferenceFiles.map(readJson);

fs.writeFileSync(
  path.resolve(__dirname, '../conferences.json'),
  JSON.stringify(conferences, undefined, 2)
);
