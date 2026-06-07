import '../src/style.scss';
import initModals from './modals.js';
import initSidenav from './sidenav.js';

const CONFERENCES_DATA_URL = './conferences.json';

const showErrorMessage = element => {
  element.innerHTML =
    '<p class="center-align">Error loading conferences. Please try again later.</p>';
};

const showNoConferencesMessage = element => {
  element.innerHTML =
    '<li class="collection-item"><span class="grey-text">No upcoming conferences found.</span></li>';
};

const getUpcomingConferences = (conferences, today) =>
  conferences
    .filter(
      conference =>
        conference['next-date'] &&
        conference['next-date'].start &&
        new Date(conference['next-date'].start) >= today
    )
    .sort(
      (a, b) => new Date(a['next-date'].start).getTime() - new Date(b['next-date'].start).getTime()
    );

const formatDateDisplay = (startDateStr, endDateStr) => {
  const startDate = new Date(startDateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!endDateStr) {
    return startDate;
  }

  const endDate = new Date(endDateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return endDate !== startDate ? `${startDate} - ${endDate}` : startDate;
};

const createConferenceItem = conference => {
  const listItem = document.createElement('li');
  listItem.className = 'collection-item';

  const dateDisplay = formatDateDisplay(conference['next-date'].start, conference['next-date'].end);

  const locationHtml = conference.location?.name
    ? `<p class="grey-text conference-meta conference-location">
          <i class="fa fa-map-marker conference-meta-icon"></i>${conference.location.name}
         </p>`
    : '';

  const descriptionHtml = conference.description
    ? `<p class="conference-description">${conference.description}</p>`
    : '';

  listItem.innerHTML = `
      <h5 class="title conference-title">
        <a href="${conference.url}" target="_blank" rel="noopener noreferrer" class="blue-text text-darken-2">
          ${conference.name}
        </a>
      </h5>
      <p class="grey-text conference-meta conference-date">
        <i class="fa fa-calendar conference-meta-icon"></i>${dateDisplay}
      </p>
      ${locationHtml}
      ${descriptionHtml}
    `;

  return listItem;
};

const displayConferences = (conferences, containerElement) => {
  conferences.forEach(conference => {
    containerElement.appendChild(createConferenceItem(conference));
  });
};

const loadConferences = async () => {
  const response = await fetch(CONFERENCES_DATA_URL);
  return response.json();
};

document.addEventListener('DOMContentLoaded', async () => {
  initModals();
  initSidenav();

  const loadingElement = document.getElementById('loading');
  const conferencesList = document.getElementById('conferences-list-page');

  let conferencesData;
  try {
    conferencesData = await loadConferences();
  } catch (error) {
    console.error('Error loading conferences:', error);
    showErrorMessage(loadingElement);
    return;
  }

  const today = new Date();
  const upcomingConferences = getUpcomingConferences(conferencesData, today);

  loadingElement.style.display = 'none';

  if (upcomingConferences.length === 0) {
    showNoConferencesMessage(conferencesList);
    return;
  }

  displayConferences(upcomingConferences, conferencesList);
});
