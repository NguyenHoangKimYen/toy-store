export function formatDate(date = new Date(), locale = navigator.language) {
  // Handle MongoDB date format
  if (date && typeof date === 'object' && date.$date) {
    date = new Date(date.$date);
  }
  
  // Convert string dates to Date objects
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
  let formattedDate = date.toLocaleDateString(locale, options);

  // Add ordinal to the day (only for English locales)
  const day = date.getDate();
  const isEnglish = locale.startsWith("en");
  if (isEnglish) {
    const ordinal = (n) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    formattedDate = formattedDate.replace(day, day + ordinal(day));
  }

  return formattedDate;
}