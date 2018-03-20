const prettyPrint = days => {

  if (days >= 30) {
    if (Math.round(days / 30) === 1) {
      return `1&nbsp;month`;
    } else {
      return `${Math.round(days / 30)}&nbsp;months`;
    }
  } else {
    if (days === 1) {
      return `1&nbsp;day`;
    } else {
      return `${days}&nbsp;days`;
    }
  }
};

export default prettyPrint;
