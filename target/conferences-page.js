document.addEventListener('DOMContentLoaded', async () => {
  $('.modal').modal();
  $('.button-collapse').sideNav();

  const loadingElement = document.getElementById('loading');
  const conferencesList = document.getElementById('conferences-list-page');

  let conferencesData = [];
  try {
    const response = await fetch('./conferences.json');
    conferencesData = await response.json();
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

  function showErrorMessage(element) {
    element.innerHTML =
      '<p class="red-text center-align">Error loading conferences. Please try again later.</p>';
  }

  function showNoConferencesMessage(element) {
    element.innerHTML =
      '<li class="collection-item"><span class="grey-text">No upcoming conferences found.</span></li>';
  }

  function getUpcomingConferences(conferences, today) {
    return conferences
      .filter((conference) => {
        return (
          conference['next-date'] &&
          conference['next-date'].start &&
          new Date(conference['next-date'].start) >= today
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a['next-date'].start);
        const dateB = new Date(b['next-date'].start);
        return dateA - dateB;
      });
  }

  function formatDateDisplay(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!endDateStr) return startDate;

    const endDate = new Date(endDateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return endDate !== startDate ? `${startDate} - ${endDate}` : startDate;
  }

  function createConferenceItem(conference) {
    const listItem = document.createElement('li');
    listItem.className = 'collection-item';

    const dateDisplay = formatDateDisplay(
      conference['next-date'].start,
      conference['next-date'].end
    );

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
  }

  function displayConferences(conferences, containerElement) {
    conferences.forEach((conference) => {
      const listItem = createConferenceItem(conference);
      containerElement.appendChild(listItem);
    });
  }
});
