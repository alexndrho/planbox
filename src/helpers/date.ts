export function getPeriodOfDay() {
  const dateNow = new Date();
  const hour = dateNow.getHours();

  if (hour >= 0 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}
