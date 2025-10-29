import { useState } from "react";
import { BandSetButton } from "./BandSetButton";
import type {
  BaybeatsDay,
  BaybeatsFestivalData,
  BaybeatsStage,
} from "../../types/types";
import { TimeColumn } from "./TimeColumn";
import { TimeMarkers } from "./TimeMarkers";
import { CurrentTime } from "./CurrentTime";
import { useGetTimeRangeStuff } from "./useGetTimeRangeStuff";
import { festival_schedule as festivalData } from "../../schedule.json";

const typedFestivalData: BaybeatsFestivalData = festivalData;

function Clashfinder() {
  const [selectedDay, setSelectedDay] = useState<BaybeatsDay>("day_1");
  const [refreshWorkaround, setRefreshWorkaround] = useState<number>(0);

  const {
    timelineHeight,
    pixelsPerMinute,
    timeMarkers,
    stages,
    dayData,
    minTime,
  } = useGetTimeRangeStuff(selectedDay, typedFestivalData);

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
        <CurrentTime minTime={minTime} pixelsPerMinute={pixelsPerMinute} />
        <div className="flex gap-0">
          {/* Time column */}
          <div className="relative flex-shrink-0 w-8 mr-4 top-12">
            <div style={{ height: `${timelineHeight}px` }} className="relative">
              <TimeColumn markers={timeMarkers} />
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
                <TimeMarkers markers={timeMarkers} />

                {/* Artist slots */}
                {dayData.stages[stage]?.map((baybeatsSet, i) => {
                  return (
                    <BandSetButton
                      setRefreshWorkaround={setRefreshWorkaround}
                      refreshWorkaround={refreshWorkaround}
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
