import './style.scss';
import initModals from './modals.js';
import initSidenav from './sidenav.js';

const CONFERENCES_DATA_URL = './conferences.json';

const showErrorMessage = element => {
  element.innerHTML =
    '<div class="alert alert-error" role="alert">Unable to load conferences right now. Please try again in a moment.</div>';
};

const showNoConferencesMessage = element => {
  element.innerHTML =
    '<li class="collection-item"><span>No upcoming conferences found.</span></li>';
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
    ? `<p class="conference-meta">
          <i class="fa fa-map-marker conference-meta-icon"></i>${conference.location.name}
         </p>`
    : '';

  const descriptionHtml = conference.description
    ? `<p class="conference-description">${conference.description}</p>`
    : '';

  listItem.innerHTML = `
      <h5>
        <a href="${conference.url}" target="_blank" rel="noopener noreferrer">
          ${conference.name}
        </a>
      </h5>
      <p class="conference-meta">
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
  if (!response.ok) {
    throw new Error(`Failed to fetch conferences: ${response.status}`);
  }
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
