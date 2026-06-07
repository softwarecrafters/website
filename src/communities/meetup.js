import fetchP from '../fetchP';

const MEETUP_GROUP_REGEX = /meetup\.com\/([^/]+)\/?/;
const createMeetupUrl = (groupName, eventId) =>
  `https://www.meetup.com/${groupName}/events/${eventId}/`;

const addMeetup = (community, div) => {
  const communityUrl = community.properties.url;
  if (!communityUrl.includes('meetup')) {
    return;
  }

  const matches = MEETUP_GROUP_REGEX.exec(communityUrl);
  const groupName = matches?.[1];
  if (!groupName) {
    return;
  }

  fetchP(`https://api.meetup.com/${groupName}?callback=`).then(result => {
    const nextEvent = result.data.next_event;
    if (!nextEvent) {
      return;
    }

    const eventEl = document.createElement('p');
    eventEl.innerHTML = `<i class="fa fa-meetup">&nbsp;</i>Next Event on ${new Date(
      nextEvent.time
    ).toLocaleDateString()}: <br/><a target="_blank" href="${createMeetupUrl(
      groupName,
      nextEvent.id
    )}">${nextEvent.name}</a>`;
    div.appendChild(eventEl);
  });
};

export default addMeetup;
