const path = require('path');
const fs = require('fs');

const communitiesDir = path.resolve(__dirname, '../communities/');
const communityFiles = fs
  .readdirSync(communitiesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(communitiesDir, file));

// validate

// write to communities.json
const communities = communityFiles.map((file) => {
  return JSON.parse(fs.readFileSync(file).toString());
});

fs.writeFileSync(
  path.resolve(__dirname, '../communities.json'),
  JSON.stringify(communities, undefined, 2)
);
