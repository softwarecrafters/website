import fetchP from "./fetchP";

const addMeetup = (community, div) => {
  if (!community.properties.url.includes("meetup")) {
    return;
  }

  const groupName = /meetup\.com\/([^\/]+)\/?/.exec(community.properties.url);

  if (typeof groupName[1] !== "string" || groupName[1].length === 0) {
    return;
  }

  fetchP(`https://api.meetup.com/${groupName[1]}?callback=`).then(result => {
    const nextEvent = result.data.next_event;
    if (!nextEvent) return;

    const eventEl = document.createElement(`p`);
    eventEl.innerHTML = `<i class="fa fa-meetup">&nbsp;</i>Next Event on ${new Date(
      nextEvent.time
    ).toLocaleDateString()}: <br/><a target="_blank" href="https://www.meetup.com/${groupName[1]}/events/${nextEvent.id}/">${nextEvent.name}</a>`;
    div.appendChild(eventEl);
  });
};

export default addMeetup;
