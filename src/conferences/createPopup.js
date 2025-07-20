import prettyPrint from '../prettyPrint';

const createCocText = conference =>
  conference.properties.coc
    ? `<p><strong><a href="${conference.properties.coc}">Code of Conduct</a></strong></p>`
    : '';

const createCovid19PolicyText = conference =>
  `<p><strong>COVID-19 Policy: </strong>${conference.properties.covid19 ?? 'not specified'}`;

const createDateText = conference => {
  if (conference.properties.start == null) return '';

  const { start, end, singleDay, isUpcoming, daysUntil } = conference.properties;

  const dateFormatted =
    (singleDay
      ? `<span class="nowrap">${start}</span>`
      : `<span class="nowrap">${start}</span> - <span class="nowrap">${end}</span>`) +
    (isUpcoming ? ` <span class="nowrap">(in ${prettyPrint(daysUntil)})</span>` : '');

  if (!isUpcoming) {
    return `<p><strong>Last:&nbsp;</strong>${dateFormatted}`;
  }

  return `<p><strong>Next:&nbsp;</strong>${dateFormatted}`;
};

const createIcon = conference => `  ${
  conference.properties.icon
    ? `<img class="popup-icon" role="presentation" src="${conference.properties.icon}">`
    : ''
}
`;

export default conference => {
  const div = document.createElement('div');
  div.classList.add('popup');
  div.classList.add('conference-popup');

  const icon = createIcon(conference);

  div.innerHTML = `
    <h1><a target="_blank" href="${conference.properties.url}">${conference.properties.name}</a>${icon}</h1>
    ${createDateText(conference)}
    ${createCocText(conference)}
    ${createCovid19PolicyText(conference)}
  `;

  return div;
};
