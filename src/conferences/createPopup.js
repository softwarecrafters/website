export default conference => {
  const div = document.createElement('div');
  div.classList.add('popup');
  div.classList.add('conference-popup');

  div.innerHTML = `
    <h1><a target="_blank" href="${conference.properties.url}">${
    conference.properties.name
  }</a></h1>
  `;

  return div;
};
