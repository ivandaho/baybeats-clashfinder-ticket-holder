import type { BaybeatsStage } from "../types/types";

const timeToMinutes = (time: string) => {
  const match = time.match(/(\d+)(?:\.(\d+))?(am|pm)/);
  if (!match) return 0;

  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const period = match[3];

  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return hour * 60 + minute;
};

const isNeedTix = (stage: BaybeatsStage) => {
  switch (stage) {
    case "Annexe":
      return true;
    case "Powerhouse":
      return true;
    default:
      return false;
  }
};

const addMinutes = (timeStr: string, minutesToAdd: number) => {
  // Parse the input time string
  const match = timeStr.match(/^(\d+)(?:\.(\d+))?(am|pm)$/i);

  if (!match) {
    throw new Error("Invalid time format");
  }

  let hours = parseInt(match[1]);
  let minutes = parseInt(match[2] || "0");
  const period = match[3].toLowerCase();

  // Convert to 24-hour format
  if (period === "pm" && hours !== 12) {
    hours += 12;
  } else if (period === "am" && hours === 12) {
    hours = 0;
  }

  minutes += minutesToAdd;

  // Handle overflow
  hours += Math.floor(minutes / 60);
  minutes = minutes % 60;

  // Handle day overflow (wrap around 24 hours)
  hours = hours % 24;

  // Convert back to 12-hour format
  const newPeriod = hours >= 12 ? "pm" : "am";
  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  // Format output
  if (minutes === 0) {
    return `${displayHours}${newPeriod}`;
  } else {
    return `${displayHours}.${minutes.toString().padStart(2, "0")}${newPeriod}`;
  }
};

export { addMinutes, timeToMinutes, isNeedTix };
