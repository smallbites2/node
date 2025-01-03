export const minsToHuman = (mins: number): string => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;

  if (hours === 0) {
    if (minutes === 0) {
      return '-';
    }
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
};
