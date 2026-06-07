const getSidenavElements = () => document.querySelectorAll('.sidenav');

const OPEN_SIDENAV_CLASS = 'is-open';
const OPEN_BODY_CLASS = 'sidenav-open';

let overlay;

const ensureOverlay = () => {
  if (overlay) {
    return overlay;
  }

  overlay = document.createElement('div');
  overlay.className = 'sidenav-overlay';
  overlay.addEventListener('click', () => closeAllSidenavs());
  document.body.appendChild(overlay);
  return overlay;
};

const hasOpenSidenav = () =>
  Array.from(getSidenavElements()).some(sidenav => sidenav.classList.contains(OPEN_SIDENAV_CLASS));

const updateBodySidenavState = () => {
  const isOpen = hasOpenSidenav();
  document.body.classList.toggle(OPEN_BODY_CLASS, isOpen);
  ensureOverlay().classList.toggle(OPEN_SIDENAV_CLASS, isOpen);
};

const openSidenav = sidenav => {
  sidenav.classList.add(OPEN_SIDENAV_CLASS);
  sidenav.style.transform = 'translateX(0)';
  updateBodySidenavState();
};

const closeSidenav = sidenav => {
  sidenav.classList.remove(OPEN_SIDENAV_CLASS);
  sidenav.style.transform = 'translateX(-102%)';
  updateBodySidenavState();
};

const closeAllSidenavs = () => {
  Array.from(getSidenavElements()).forEach(sidenav => {
    closeSidenav(sidenav);
  });
};

const resetSidenavState = () => {
  Array.from(getSidenavElements()).forEach(sidenav => {
    sidenav.classList.remove(OPEN_SIDENAV_CLASS);
    sidenav.style.transform = 'translateX(-102%)';
  });

  document.body.classList.remove(OPEN_BODY_CLASS);

  const overlayEl = ensureOverlay();
  overlayEl.classList.remove(OPEN_SIDENAV_CLASS);
};

const bindSidenavLinkClose = sidenav => {
  sidenav.querySelectorAll('a').forEach(link => {
    if (link.dataset.sidenavCloseBound === 'true') {
      return;
    }

    link.addEventListener('click', () => closeAllSidenavs());
    link.dataset.sidenavCloseBound = 'true';
  });
};

const bindSidenavTriggers = () => {
  document.querySelectorAll('.sidenav-trigger').forEach(trigger => {
    if (trigger.dataset.sidenavTriggerBound === 'true') {
      return;
    }

    trigger.addEventListener('click', event => {
      event.preventDefault();
      const targetId = trigger.getAttribute('data-target');
      if (!targetId) {
        return;
      }

      const targetSidenav = document.getElementById(targetId);
      if (!targetSidenav?.classList.contains('sidenav')) {
        return;
      }

      if (targetSidenav.classList.contains(OPEN_SIDENAV_CLASS)) {
        closeSidenav(targetSidenav);
        return;
      }

      closeAllSidenavs();
      openSidenav(targetSidenav);
    });

    trigger.dataset.sidenavTriggerBound = 'true';
  });
};

const bindModalTriggerClose = () => {
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.target.closest('.modal-trigger')) {
      closeAllSidenavs();
    }
  });
};

const bindEscapeClose = () => {
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeAllSidenavs();
    }
  });
};

const initSidenav = () => {
  const sidenavs = getSidenavElements();
  if (!sidenavs.length) {
    return;
  }

  ensureOverlay();
  resetSidenavState();
  bindSidenavTriggers();
  Array.from(sidenavs).forEach(bindSidenavLinkClose);
  bindModalTriggerClose();
  bindEscapeClose();

  window.addEventListener('pageshow', () => {
    resetSidenavState();
  });

  window.addEventListener('pagehide', () => {
    resetSidenavState();
  });

  window.addEventListener('load', () => {
    resetSidenavState();
  });

  requestAnimationFrame(() => {
    resetSidenavState();
  });
};

export default initSidenav;
