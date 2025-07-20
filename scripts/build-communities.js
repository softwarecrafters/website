const glob = require('glob');
const path = require('path');
const fs = require('fs');

const communityFiles = glob.sync(path.resolve(__dirname, '../communities/') + '/*.json');

// validate

// write to communities.json
const communities = communityFiles.map(file => {
  return JSON.parse(fs.readFileSync(file).toString());
});

fs.writeFileSync(
  path.resolve(__dirname, '../communities.json'),
  JSON.stringify(communities, undefined, 2)
);
