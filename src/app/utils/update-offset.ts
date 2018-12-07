export const updateOffset = (date: Date): Date => {
  return new Date(date.getTime() + 3600000 * (date.getTimezoneOffset() / 60));
};
