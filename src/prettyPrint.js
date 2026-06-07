const prettyPrint = days => {
  if (days >= 30) {
    const months = Math.round(days / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  }

  return `${days} day${days === 1 ? '' : 's'}`;
};

export default prettyPrint;
