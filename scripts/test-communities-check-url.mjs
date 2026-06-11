import path from 'path';
import fs from 'fs';

const communitiesDir = path.resolve(import.meta.dirname, '../communities/');

const communitiesPath = fs
  .readdirSync(communitiesDir)
  .filter(file => file.endsWith('.json'))
  .map(file => path.join(communitiesDir, file));

const communities = communitiesPath
  .map(file => fs.readFileSync(file).toString())
  .map(fileContent => JSON.parse(fileContent));

const fetchCommunities = communities.map(community => fetch(community.url));

const failedURL = (await Promise.all(fetchCommunities))
  .filter(communityResponse => !communityResponse.ok)
  .map(communityResponse => communityResponse.url);

if (failedURL.length > 0) {
  console.log(failedURL);
  process.exit(1);
}
