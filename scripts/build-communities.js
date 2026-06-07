const path = require('path');
const fs = require('fs');
const { listJsonFiles, readJson } = require('./jsonFiles');

const communitiesDir = path.resolve(__dirname, '../communities');
const communityFiles = listJsonFiles(communitiesDir);

// validate

// write to communities.json
const communities = communityFiles.map(readJson);

fs.writeFileSync(
  path.resolve(__dirname, '../communities.json'),
  JSON.stringify(communities, undefined, 2)
);
