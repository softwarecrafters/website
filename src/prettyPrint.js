const prettyPrint = days => {
  const numberOfMonths = Math.floor(days / 30);

  if (numberOfMonths >= 1) {
    return `${numberOfMonths} months`;
  } else {
    if (days === 1) {
      return `1 day`;
    } else {
      return `${days} days`;
    }
  }
};

export default prettyPrint;
