import { useState } from "react";

import { festival_schedule as festivalData } from "../../schedule.json";
import { BandSetButton } from "./BandSetButton";
import { timeToMinutes } from "../../utils/clashfinder";
import type {
  BaybeatsDay,
  BaybeatsFestivalData,
  BaybeatsStage,
} from "../../types/types";

function Clashfinder() {
  const [selectedDay, setSelectedDay] = useState<BaybeatsDay>("day_1");

  const typedFestivalData: BaybeatsFestivalData = festivalData;
  const dayData = typedFestivalData[selectedDay];
  const stages = Object.keys(dayData.stages) as BaybeatsStage[];

  // Find time range
  let minTime = Infinity;
  let maxTime = 0;

  stages.forEach((stage) => {
    dayData.stages[stage]?.forEach((baybeatsSet) => {
      const startMinutes = timeToMinutes(baybeatsSet.time);
      const endMinutes = startMinutes + 45; // 45 min set
      minTime = Math.min(minTime, startMinutes);
      maxTime = Math.max(maxTime, endMinutes);
    });
  });

  // Round to hour boundaries
  minTime = Math.floor(minTime / 60) * 60;
  maxTime = Math.ceil(maxTime / 60) * 60;

  const totalMinutes = maxTime - minTime;
  const pixelsPerMinute = 2; // Scale factor
  const timelineHeight = totalMinutes * pixelsPerMinute;

  // Generate hour markers
  const hourMarkers: {
    minutes: number;
    label: string;
    position: number;
  }[] = [];

  for (let minutes = minTime; minutes <= maxTime; minutes += 60) {
    const hour = Math.floor(minutes / 60);
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const period = hour >= 12 ? "pm" : "am";
    hourMarkers.push({
      minutes,
      label: `${displayHour}${period}`,
      position: (minutes - minTime) * pixelsPerMinute,
    });
  }

  return (
    <div className="bg-gradient-to-br rounded-lg from-fuchsia-900 via-fuchsia-1000 to-fuchsia-1000 sm:p-4">
      <div className="pl-1">
        <h1 className="text-4xl font-bold text-white mt-4">
          Baybeats 2025 Clashfinder
        </h1>
        <h4 className="text-white text-xs leading-tight max-w-screen">
          Clashfinder + ticket management. click any band slot to store any
          ticket on this device. everything runs locally, nothing is uploaded.
          <br />
        </h4>
        <h4 className="text-white text-xs leading-tight mb-6 max-w-screen">
          Tickets required only for performances at Powerhouse and Annexe.
        </h4>
      </div>
      <div className="flex gap-3 text-nowrap py-2 px-2 max-w-screen">
        {(Object.keys(typedFestivalData) as BaybeatsDay[]).map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-2 py-1 rounded-md font-semibold transition-all text-sm ${
              selectedDay === day
                ? "bg-white text-purple-900 shadow-lg scale-105"
                : "text-white hover:bg-purple-700"
            }`}
          >
            {typedFestivalData[day].date}
          </button>
        ))}
      </div>
      <div className="bg-fuchsia-950 backdrop-blur-sm rounded-xl px-2 max-w-[1200px]">
        <div className="flex gap-0">
          {/* Time column */}
          <div
            className="relative flex-shrink-0 w-8 mr-4"
            style={{ top: "40px" }}
          >
            <div style={{ height: `${timelineHeight}px` }} className="relative">
              {hourMarkers.map((marker) => (
                <div
                  key={marker.minutes}
                  className="absolute left-0 right-0 text-white text-sm font-semibold"
                  style={{ top: `${marker.position}px` }}
                >
                  {marker.label}
                </div>
              ))}
            </div>
          </div>

          {/* Stage columns */}
          {stages.map((stage) => (
            <div key={stage} className="flex-1 min-w-[120px] max-w-[240px]">
              <div className="bg-fuchsia-950 text-white font-bold text-center mb-4 p-2 border-b-2 border-white/30 text-nowrap truncate sticky top-0 z-11">
                {stage}
              </div>
              <div
                className="relative border-l-2 border-white/20"
                style={{ height: `${timelineHeight}px` }}
              >
                {/* Hour grid lines */}
                {hourMarkers.map((marker) => (
                  <div
                    key={marker.minutes}
                    className="absolute left-0 right-0 border-t border-white/10 flex justify-center"
                    style={{ top: `${marker.position}px` }}
                  >
                    <span className="absolute top-[-0.5rem] self-center text-xs opacity-25">
                      {marker.label}
                    </span>
                  </div>
                ))}

                {/* Artist slots */}
                {dayData.stages[stage]?.map((baybeatsSet, i) => {
                  return (
                    <BandSetButton
                      key={i}
                      baybeatsSet={baybeatsSet}
                      stage={stage as BaybeatsStage}
                      minTime={minTime}
                      pixelsPerMinute={pixelsPerMinute}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Clashfinder;
