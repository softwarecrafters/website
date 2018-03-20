import prettyPrint from '../prettyPrint';

const createCocText = conference =>
  conference.properties.coc
    ? `<p><a href="${conference.properties.coc}">Code of Conduct</a></p>`
    : '';

const createDateText = conference => {
  if (conference.properties.start == null) return '';

  const {
    start,
    end,
    singleDay,
    isUpcoming,
    daysUntil
  } = conference.properties;

  const dateFormatted =
    (singleDay ? start : `${start} - ${end}`) +
    (isUpcoming ? ` (in ${prettyPrint(daysUntil).replace(' ', '&nbsp;'})` : '');

  if (!isUpcoming) {
    return `<p><strong>Last:&nbsp;</strong>${dateFormatted}`;
  }

  return `<p><strong>Next:&nbsp;</strong>${dateFormatted}`;
};

export default conference => {
  const div = document.createElement('div');
  div.classList.add('popup');
  div.classList.add('conference-popup');

  const dateLine = createDateText(conference);
  const cocLine = createCocText(conference);

  div.innerHTML = `
    <h1><a target="_blank" href="${conference.properties.url}">${
    conference.properties.name
  }</a></h1>
    ${dateLine}
    ${cocLine}
  `;

  return div;
};
