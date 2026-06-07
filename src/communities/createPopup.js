import addMeetup from './meetup';

export default community => {
  const div = document.createElement('div');
  div.classList.add('popup');
  div.classList.add('community-popup');

  const icon = community.properties.icon
    ? `<img class="popup-icon" role="presentation" src="${community.properties.icon}">`
    : '';

  div.innerHTML = `
    <h1><a target="_blank" href="${community.properties.url}">${community.properties.name}</a>
  ${icon}
  </h1>
  `;

  addMeetup(community, div);

  return div;
};
