import addMeetup from './meetup';

export default community => {
  const div = document.createElement("div");
  div.classList.add("popup");
  div.classList.add("community-popup");

  div.innerHTML = `
    <h1><a target="_blank" href="${community.properties.url}">${community
    .properties.name}</a></h1>
  `;

  addMeetup(community, div);

  return div;
};
