import type {
  BaybeatsDay,
  BaybeatsFestivalData,
  BaybeatsStage,
  FestivalDay,
  TimeMarker,
} from "../../types/types";
import { timeToMinutes } from "../../utils/clashfinder";

const pixelsPerMinute = 2; // Scale factor

const useGetTimeRangeStuff = (
  selectedDay: BaybeatsDay,
  typedFestivalData: BaybeatsFestivalData,
): {
  timelineHeight: number;
  timeMarkers: TimeMarker[];
  stages: BaybeatsStage[];
  dayData: FestivalDay;
  pixelsPerMinute: number;
  minTime: number;
} => {
  const dayData = typedFestivalData[selectedDay];
  const stages = Object.keys(dayData.stages) as BaybeatsStage[];

  // Find time range
  let minTime = Infinity;
  let maxTime = 0;

  stages.forEach((stage) => {
    dayData.stages[stage]?.forEach((baybeatsSet) => {
      const startMinutes = timeToMinutes(baybeatsSet.startTime);
      const endMinutes = startMinutes + 45;
      minTime = Math.min(minTime, startMinutes);
      maxTime = Math.max(maxTime, endMinutes);
    });
  });

  // Round to hour boundaries
  minTime = Math.floor(minTime / 60) * 60;
  maxTime = Math.ceil(maxTime / 60) * 60;

  const totalMinutes = maxTime - minTime;
  const timelineHeight = totalMinutes * pixelsPerMinute;

  // Generate hour markers
  let timeMarkers: TimeMarker[] = [];

  for (let minutes = minTime; minutes <= maxTime; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const period = hour >= 12 ? "pm" : "am";
    const isHour = minutes % 60 === 0;

    timeMarkers = timeMarkers.concat({
      minutes,
      displayHour,
      period,
      isHour,
      position: (minutes - minTime) * pixelsPerMinute,
    });
  }

  return {
    timelineHeight,
    timeMarkers,
    stages,
    dayData,
    minTime,
    pixelsPerMinute,
  };
};
export { useGetTimeRangeStuff };
