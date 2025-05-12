function getDateWithLocale(
  date: Date,
  localeLanguageTag: string,
  timeZone: string,
) {
  const formatter = new Intl.DateTimeFormat(localeLanguageTag, {
    timeZone: timeZone,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}

export { getDateWithLocale };
