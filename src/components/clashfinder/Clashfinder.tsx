import { useState } from "react";

import { festival_schedule as festivalData } from "../../schedule.json";

function timeToMinutes(time) {
  const match = time.match(/(\d+)(?:\.(\d+))?(am|pm)/);
  if (!match) return 0;

  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const period = match[3];

  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function ClashFinder() {
  const [selectedDay, setSelectedDay] = useState("day_1");

  const dayData = festivalData[selectedDay];
  const stages = Object.keys(dayData.stages);

  // Find time range
  let minTime = Infinity;
  let maxTime = 0;

  stages.forEach((stage) => {
    dayData.stages[stage].forEach((slot) => {
      const startMinutes = timeToMinutes(slot.time);
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
  const hourMarkers = [];
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Festival Clashfinder
        </h1>

        {/* Day selector */}
        <div className="flex gap-3 mb-8 justify-center flex-wrap">
          {Object.keys(festivalData).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedDay === day
                  ? "bg-white text-purple-900 shadow-lg scale-105"
                  : "bg-purple-800 text-white hover:bg-purple-700"
              }`}
            >
              {festivalData[day].date}
            </button>
          ))}
        </div>

        {/* Schedule grid */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 overflow-x-auto">
          <div className="flex gap-0">
            {/* Time column */}
            <div className="relative flex-shrink-0 w-20 mr-4">
              <div
                style={{ height: `${timelineHeight}px` }}
                className="relative"
              >
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
              <div key={stage} className="flex-1 min-w-[200px] mx-1">
                <div className="text-white font-bold text-center mb-4 pb-2 border-b-2 border-white/30">
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
                      className="absolute left-0 right-0 border-t border-white/10"
                      style={{ top: `${marker.position}px` }}
                    />
                  ))}

                  {/* Artist slots */}
                  {dayData.stages[stage].map((slot, idx) => {
                    const startMinutes = timeToMinutes(slot.time);
                    const topPosition =
                      (startMinutes - minTime) * pixelsPerMinute;
                    const height = 45 * pixelsPerMinute; // 45 min set

                    return (
                      <div
                        key={idx}
                        className="absolute left-1 right-1 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-2 overflow-hidden hover:scale-105 hover:z-10 transition-transform cursor-pointer shadow-lg"
                        style={{
                          top: `${topPosition}px`,
                          height: `${height}px`,
                        }}
                      >
                        <div className="text-white font-bold text-xs mb-1">
                          {slot.time}
                        </div>
                        <div className="text-white font-semibold text-sm leading-tight">
                          {slot.artist}
                        </div>
                        {slot.note && (
                          <div className="text-white/80 text-xs italic mt-1 leading-tight">
                            {slot.note}
                          </div>
                        )}
                        {slot.event && (
                          <div className="text-white text-xs mt-1 leading-tight">
                            {slot.event}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClashFinder;
