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

const communitiesResponses = await Promise.all(fetchCommunities);

const failedURLNotOK = communitiesResponses
  .filter(communityResponse => !communityResponse.ok)
  .map(communityResponse => communityResponse.url);

// meetup.com answer with HTTP 200 when a group is not found
const meetupGroupsNotFound = (
  await Promise.all(
    communitiesResponses
      .filter(communityResponse => communityResponse.ok)
      .map(async communityResponse => {
        const communityHTML = await communityResponse.text();
        return /<title[^>]*>Meetup | Group not found<\/title>/.test(communityHTML)
          ? communityResponse.url
          : null;
      })
  )
).filter(maybeURL => maybeURL !== null);

const failedURL = failedURLNotOK.concat(meetupGroupsNotFound);

if (failedURL.length > 0) {
  console.log({ failedURL, failedURLCount: failedURL.length, total: communitiesPath.length });
  process.exit(1);
}
