const getModalElements = () => document.querySelectorAll('.modal');

const OPEN_MODAL_CLASS = 'is-open';
const OPEN_BODY_CLASS = 'modal-open';

let activeModal = null;
let lastFocusedElement = null;

const getBackdrop = modal => modal.nextElementSibling;

const ensureBackdrop = modal => {
  const existingBackdrop = getBackdrop(modal);
  if (existingBackdrop?.classList.contains('modal-backdrop')) {
    return existingBackdrop;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.addEventListener('click', () => dismissAll());
  modal.insertAdjacentElement('afterend', backdrop);
  return backdrop;
};

const updateBodyModalState = () => {
  const hasOpenModal = Array.from(getModalElements()).some(modal =>
    modal.classList.contains(OPEN_MODAL_CLASS)
  );

  document.body.classList.toggle(OPEN_BODY_CLASS, hasOpenModal);
};

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableElements = modal =>
  Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => {
    if (!(el instanceof HTMLElement)) {
      return false;
    }

    return !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true';
  });

const focusFirstElement = modal => {
  const focusable = getFocusableElements(modal);
  if (focusable.length > 0) {
    focusable[0].focus();
    return;
  }

  modal.focus();
};

const restoreFocus = () => {
  if (lastFocusedElement instanceof HTMLElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
};

const openModal = modal => {
  if (!modal) {
    return;
  }

  modal.classList.add(OPEN_MODAL_CLASS);
  modal.removeAttribute('inert');
  modal.inert = false;
  modal.setAttribute('aria-hidden', 'false');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('tabindex', '-1');
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  const backdrop = ensureBackdrop(modal);
  backdrop.classList.add(OPEN_MODAL_CLASS);
  backdrop.style.opacity = '1';
  backdrop.style.pointerEvents = 'auto';
  activeModal = modal;
  updateBodyModalState();
  addModalHashToUrl(modal);

  requestAnimationFrame(() => {
    focusFirstElement(modal);
  });
};

const closeModal = modal => {
  if (!modal) {
    return;
  }

  modal.classList.remove(OPEN_MODAL_CLASS);
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');
  modal.inert = true;
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
  const backdrop = getBackdrop(modal);
  backdrop?.classList.remove(OPEN_MODAL_CLASS);
  if (backdrop) {
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';
  }
  if (activeModal === modal) {
    activeModal = null;
  }
  updateBodyModalState();
};

const dismissAll = () => {
  Array.from(getModalElements()).forEach(modal => {
    closeModal(modal);
  });

  restoreFocus();
  clearHashInUrl();
};

const dismissAllBut = modalId => {
  Array.from(getModalElements()).forEach(modal => {
    if (`#${modal.id}` === modalId) {
      openModal(modal);
    } else {
      closeModal(modal);
    }
  });
};

const addModalHashToUrl = modalEl => {
  if (!modalEl?.id) {
    return;
  }

  window.history.pushState(
    {},
    document.title,
    window.location.pathname + window.location.search + '#' + modalEl.id
  );
};

const clearHashInUrl = () => {
  window.history.pushState({}, document.title, window.location.pathname + window.location.search);
};

const bindModalTriggers = () => {
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest('.modal-trigger');
    if (!trigger) {
      return;
    }

    const hash = trigger.getAttribute('href');
    if (!hash?.startsWith('#')) {
      return;
    }

    const modal = document.querySelector(hash);
    if (!modal?.classList.contains('modal')) {
      return;
    }

    event.preventDefault();
    lastFocusedElement = trigger;
    dismissAllBut(hash);
  });
};

const bindModalCloseButtons = () => {
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const closeTrigger = event.target.closest('.modal-close');
    if (!closeTrigger) {
      return;
    }

    event.preventDefault();
    dismissAll();
  });
};

const bindEscapeClose = () => {
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && activeModal) {
      const focusable = getFocusableElements(activeModal);
      if (focusable.length === 0) {
        event.preventDefault();
        activeModal.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
        return;
      }
    }

    if (event.key === 'Escape') {
      dismissAll();
    }
  });
};

const initModals = () => {
  Array.from(getModalElements()).forEach(modal => {
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    modal.inert = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('tabindex', '-1');
    ensureBackdrop(modal);
  });

  window.addEventListener('popstate', () => {
    if (window.location.hash) {
      dismissAllBut(window.location.hash);
    } else {
      dismissAll();
    }
  });

  bindModalTriggers();
  bindModalCloseButtons();
  bindEscapeClose();

  if (window.location.hash) {
    dismissAllBut(window.location.hash);
  } else {
    dismissAll();
  }
};

export default initModals;
