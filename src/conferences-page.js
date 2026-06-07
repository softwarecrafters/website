import '../src/style.scss';

const CONFERENCES_DATA_URL = './conferences.json';

const showErrorMessage = element => {
  element.innerHTML =
    '<p class="red-text center-align">Error loading conferences. Please try again later.</p>';
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
    ? `<p class="grey-text" style="margin: 5px 0;">
          <i class="fa fa-map-marker" style="margin-right: 8px;"></i>${conference.location.name}
         </p>`
    : '';

  const descriptionHtml = conference.description
    ? `<p style="margin: 10px 0;">${conference.description}</p>`
    : '';

  listItem.innerHTML = `
      <div class="row" style="margin-bottom: 0;">
        <div class="col s12">
          <h5 class="title" style="margin: 0;">
            <a href="${conference.url}" target="_blank" rel="noopener noreferrer" class="blue-text text-darken-2">
              ${conference.name}
            </a>
          </h5>
          <p class="grey-text" style="margin: 5px 0;">
            <i class="fa fa-calendar" style="margin-right: 8px;"></i>${dateDisplay}
          </p>
          ${locationHtml}
          ${descriptionHtml}
        </div>
      </div>
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
  $('.modal').modal();
  $('.button-collapse').sideNav();

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
