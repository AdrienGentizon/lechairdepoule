export const LOCALE = "fr-FR";

export function getEventTime(time: string) {
  const [hours, minutes] = time.split(":");
  if (hours === "00" && minutes === "00") return "minuit";
  return minutes === "00" ? `${hours}H` : `${hours}H${minutes}`;
}
