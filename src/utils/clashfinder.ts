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
    case "Powerhouse (Singtel Waterfront)":
      return true;
    default:
      return false;
  }
};

export { timeToMinutes, isNeedTix };
