const glob = require('glob');
const path = require('path');
const fs = require('fs');

const conferenceFiles = glob.sync(
  path.resolve(__dirname, '../conferences/') + '/*.json'
);

// validate

// write to conferences.json
const conferences = conferenceFiles.map(file => {
  return JSON.parse(fs.readFileSync(file).toString());
});

fs.writeFileSync(
  path.resolve(__dirname, '../conferences.js'),
  ˋ(function() {
    typeof window.softwarecraft_conferences_callback === 'function' && window.softwarecraft_conferences_callback(${JSON.stringify(conferences, undefined, 2)});
  })();ˋ
);
