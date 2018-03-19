const prettyPrint = days => {
  const numberOfMonths = Math.floor(days / 30);

  if (numberOfMonths >= 1) {
    if (Math.round(days / 30) === 1) {
      return `1 month`;
    } else {
      return `${Math.round(days / 30)} months`;
    }
  } else {
    if (days === 1) {
      return `1 day`;
    } else {
      return `${days} days`;
    }
  }
};

export default prettyPrint;
