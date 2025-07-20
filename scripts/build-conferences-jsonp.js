const path = require('path');
const fs = require('fs');

const conferencesDir = path.resolve(__dirname, '../conferences/');
const conferenceFiles = fs
  .readdirSync(conferencesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(conferencesDir, file));

// validate

// write to conferences.json
const conferences = conferenceFiles.map((file) => {
  return JSON.parse(fs.readFileSync(file).toString());
});

fs.writeFileSync(
  path.resolve(__dirname, '../conferences.js'),
  `(function() {
    typeof window.softwarecraft_conferences_callback === 'function' && window.softwarecraft_conferences_callback(${JSON.stringify(
      conferences,
      undefined,
      2
    )});
  })();`
);
