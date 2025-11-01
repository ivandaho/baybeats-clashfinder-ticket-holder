import { useEffect, useState } from "react";
import { BandSetButton } from "./BandSetButton";
import type {
  BaybeatsDay,
  BaybeatsFestivalData,
  BaybeatsStage,
  UniqTixCountFormat,
} from "../../types/types";
import { TimeColumn } from "./TimeColumn";
import { TimeMarkers } from "./TimeMarkers";
import { useGetTimeRangeStuff } from "./useGetTimeRangeStuff";
import { festival_schedule as festivalData } from "../../schedule.json";
import { H4 } from "./H4";
import {
  getStoredPdfCount,
  migrateLegacyData,
  removeAllPDFData,
} from "../../utils/pdf";
import { debounce, getTodayBaybeatsDay } from "../../utils/clashfinder";
import { CurrentTime } from "./CurrentTime";

const typedFestivalData: BaybeatsFestivalData = festivalData;

const offset = -10; // huh ???

function Clashfinder() {
  const todayBaybeatsDay = getTodayBaybeatsDay();
  const [selectedDay, setSelectedDay] = useState<BaybeatsDay>(todayBaybeatsDay);
  const [refreshWorkaround, setRefreshWorkaround] = useState<number>(0);
  const showCurrentTime = selectedDay === todayBaybeatsDay;

  const {
    timelineHeight,
    pixelsPerMinute,
    timeMarkers,
    stages,
    dayData,
    minTime,
  } = useGetTimeRangeStuff(selectedDay, typedFestivalData);
  const [bandSetCount, setBandSetCount] = useState<null | number>(null);
  const [hideBanner, setHideBanner] = useState<boolean>(
    localStorage.getItem("hideBanner") === "hide",
  );
  const [tixCount, setTixCount] = useState<null | number>(null);
  const [isMigrating, setIsMigrating] = useState<boolean>(true);
  const [currentTimePos, setCurrentTimePos] = useState(-1);

  useEffect(() => {
    const fn = async () => {
      setBandSetCount(await getStoredPdfCount());
    };
    fn();
  }, []);

  useEffect(() => {
    let tixCounter = 0;
    const migrationCheck = async () => {
      let isOldVersion = false;
      if (localStorage.getItem("hasMigrated") === "true") {
        setIsMigrating(false);
      } else {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key === "hideBanner" || key === "hasMigrated") {
            continue;
          }
          const dataFromLS = localStorage.getItem(key || "");
          if (typeof dataFromLS === "string" && parseInt(dataFromLS)) {
            isOldVersion = true;
            break;
          }
        }
      }

      if (isOldVersion) {
        await migrateLegacyData();
        localStorage.setItem("hasMigrated", "true");
        setIsMigrating(false);
      } else {
        setIsMigrating(false);
      }
    };
    migrationCheck();

    if (!isMigrating) {
      let setCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key === "hideBanner" || key === "hasMigrated") {
          continue;
        }
        try {
          setCount++;
          const data: UniqTixCountFormat[] = JSON.parse(
            localStorage.getItem(key || "") || "",
          );
          data.forEach((d) => {
            tixCounter += d.tixCount;
          });
        } catch (e) {
          // ignore
        }
      }
      setTixCount(tixCounter);
      setBandSetCount(setCount);
    }
  }, [refreshWorkaround, isMigrating]);

  useEffect(() => {
    calculateCurrentTimePos();
  }, []);

  const closeBanner = () => {
    localStorage.setItem("hideBanner", "hide");
    setHideBanner(true);
  };

  const promptDelete = async () => {
    const d = window.prompt(
      'type "DELETE" and submit to delete all data (no undo!)',
    );
    if (d === "DELETE") {
      const result = await removeAllPDFData();
      if (result) {
        localStorage.clear();
        setRefreshWorkaround(new Date().getTime());
        setBandSetCount(0);
        window.alert("data deleted");
      }
    }
  };

  const calculateCurrentTimePos = () => {
    const d = new Date();
    let dHours = d.getHours();
    const dMinutes = d.getMinutes() + 5;
    const minutes = dHours * 60 + dMinutes;
    const newPos = (minutes - minTime) * pixelsPerMinute + 60 + offset;
    setCurrentTimePos(newPos);
  };

  if (isMigrating) {
    return (
      <div className="bg-gradient-to-br from-fuchsia-900 via-fuchsia-1000 to-fuchsia-1000 w-screen overflow-scroll h-screen text-white p-4">
        <H4>Migrating data...</H4>
      </div>
    );
  }

  const debounced = debounce(() => {
    calculateCurrentTimePos();
  }, 1000);

  return (
    <div className="bg-gradient-to-br from-fuchsia-900 via-fuchsia-1000 to-fuchsia-1000 w-screen overflow-scroll h-screen">
      {hideBanner ? null : (
        <div className="pl-1">
          <h1 className="text-4xl font-bold text-white mt-4 flex">
            Baybeats 2025 Clashfinder
            <span
              onClick={closeBanner}
              className="p-2 text-[8px] h-20 w-20 text-center text-nowrap text-white/50 cursor-pointer"
            >
              close banner
            </span>
          </h1>
          <H4>
            Ticket management: Click <strong>any</strong> band slot to start
            storing tickets for <strong>any</strong> set, only on this device.
            You may select tickets for multiple sets at once.
          </H4>
          <H4>
            <strong>now supporting multiple pdf downloads.</strong>
          </H4>
          <H4>Everything runs locally, nothing is uploaded.</H4>
          <H4>
            Tickets required only for performances at Powerhouse and Annexe.
          </H4>
          <H4>
            You have stored <strong>{tixCount}</strong> tickets for{" "}
            <strong>{bandSetCount}</strong> sets.
          </H4>
          <H4>
            After storing tickets, click the slot to access your ticket(s) for
            that set.
            <a
              href="https://www.esplanade.com/baybeats"
              className="rounded-md font-semibold text-xs text-white content-center px-1"
            >
              Baybeats Website
            </a>
            <a
              href="https://github.com/ivandaho/baybeats-clashfinder-ticket-holder"
              className="rounded-md font-semibold text-xs text-white content-center px-1"
            >
              Code
            </a>
          </H4>
          {tixCount && tixCount > 0 ? (
            <H4
              onClick={(e) => {
                e.preventDefault();
                promptDelete();
              }}
              className="!text-red-500 mt-2 text-[10px] cursor-pointer"
            >
              DELETE ALL DATA
            </H4>
          ) : null}
        </div>
      )}
      <div className="flex gap-3 text-nowrap py-2 pb-2 pt-8 overflow-x-auto">
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
        {hideBanner ? (
          <button
            onClick={() => {
              localStorage.removeItem("hideBanner");
              setHideBanner(false);
            }}
            className={`rounded-md font-semibold text-sm text-white hover:bg-purple-700" `}
          >
            info
          </button>
        ) : null}
      </div>
      <div className="rounded-xl px-1">
        <div
          className="flex gap-0 overflow-x-auto h-screen"
          onScrollEnd={debounced}
        >
          {/* Time column */}
          <div className="relative flex-shrink-0 w-8 mr-4 top-12">
            <div style={{ height: `${timelineHeight}px` }} className="relative">
              <TimeColumn markers={timeMarkers} />
            </div>
          </div>

          {/* Stage columns */}
          {stages.map((stage) => (
            <div
              key={stage}
              className="flex-1 min-w-[120px] max-w-[240px] bg-fuchsia-950 backdrop-blur-sm"
              style={{ height: `${timelineHeight + 134}px` }} // huh?
            >
              {showCurrentTime && <CurrentTime pos={currentTimePos} />}
              <div className="bg-fuchsia-950 text-white font-bold text-center mb-4 p-2 border-b-2 border-white/30 text-nowrap truncate sticky top-0 z-11">
                {stage}
              </div>
              <div
                className="relative border-l-2 border-white/20 l-[-1px]"
                style={{
                  height: `${timelineHeight + 75}px`,
                }}
              >
                {/* Hour grid lines */}
                <TimeMarkers markers={timeMarkers} />

                {/* Artist slots */}
                {dayData.stages[stage]?.map((baybeatsSet) => {
                  return (
                    <BandSetButton
                      setBandSetCount={setBandSetCount}
                      refreshWorkaround={refreshWorkaround}
                      setRefreshWorkaround={setRefreshWorkaround}
                      key={`${baybeatsSet.artist}-${stage}-${baybeatsSet.startTime}`}
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
