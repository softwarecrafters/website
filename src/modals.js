const dismissAll = () => {
  $('.modal').modal('close');
};

const dismissAllBut = modalId => {
  $('.modal')
    .not(modalId)
    .modal('close');
  $(modalId).modal('open');
};

const addModalHashToUrl = modal => {
  window.history.pushState(
    {},
    document.title,
    window.location.pathname + window.location.search + '#' + modal.attr('id')
  );
};

const clearHashInUrl = () => {
  window.history.pushState(
    {},
    document.title,
    window.location.pathname + window.location.search
  );
};

const initModals = () => {
  $(window).bind('popstate', () => {
    if (window.location.hash) {
      dismissAllBut(window.location.hash);
    } else {
      dismissAll();
    }
  });

  $('.modal').modal({
    ready: addModalHashToUrl,
    complete: clearHashInUrl
  });

  if (window.location.hash) {
    dismissAllBut(window.location.hash);
  }
};

export default initModals;
