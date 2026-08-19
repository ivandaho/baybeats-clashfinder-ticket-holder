import { useEffect, useState } from "react";
import { BandSetButton } from "./BandSetButton";
import type {
  BaybeatsDay,
  BaybeatsFestivalData,
  BaybeatsStage,
  UniqTixCountFormat,
} from "../../types/types";
import { TimeMarkers } from "./TimeMarkers";
import { useGetTimeRangeStuff } from "./useGetTimeRangeStuff";
import { festival_schedule as festivalData2026 } from "../../schedules/schedule-2026.json";
import { festival_schedule as festivalData2025 } from "../../schedules/schedule-2025.json";
import { H4 } from "./H4";
import {
  getStoredPdfCount,
  migrateLegacyData,
  removeAllPDFData,
} from "../../utils/pdf";
import { debounce, getTodayBaybeatsDay } from "../../utils/clashfinder";
import { CurrentTime } from "./CurrentTime";
import { Banner } from "./Banner";
import { SelectDayButton } from "../selectDayButton/SelectDayButton";
import { TableHeader } from "../tableHeader/TableHeader";
import cx from "../../utils/cx";

const gradientCSS =
  "bg-gradient-to-br from-fuchsia-900 via-fuchsia-1000 to-fuchsia-1000";

function Clashfinder() {
  const todayBaybeatsDay = getTodayBaybeatsDay();
  const [selectedDay, setSelectedDay] = useState<BaybeatsDay>(
    todayBaybeatsDay === "not_baybeats_yet" ? "day_1" : todayBaybeatsDay,
  );
  const [refreshWorkaround, setRefreshWorkaround] = useState<number>(0);
  const showCurrentTime = selectedDay === todayBaybeatsDay;
  const [bandSetCount, setBandSetCount] = useState<null | number>(null);
  const [tixCount, setTixCount] = useState<null | number>(null);
  const [isMigrating, setIsMigrating] = useState<boolean>(true);
  const [currentTimePos, setCurrentTimePos] = useState(-1);
  const [year, setYear] = useState("2026");

  // TODO: support more than 2 years?
  const typedFestivalData: BaybeatsFestivalData =
    year === "2026" ? festivalData2026 : festivalData2025;

  const {
    timelineHeight,
    pixelsPerMinute,
    timeMarkers,
    stages,
    dayData,
    minTime,
  } = useGetTimeRangeStuff(selectedDay, typedFestivalData);

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

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
    // support until 5am of same day
    if (dHours <= 5) {
      dHours += 24;
    }
    const dMinutes = d.getMinutes() + 5;
    const minutes = dHours * 60 + dMinutes;
    const newPos = (minutes - minTime) * pixelsPerMinute;
    setCurrentTimePos(newPos);
  };

  if (isMigrating) {
    return (
      <div
        className={cx(
          gradientCSS,
          "w-screen overflow-scroll h-screen text-white p-4",
        )}
      >
        <H4>Migrating data...</H4>
      </div>
    );
  }

  const stageFlexClass = "flex-1 min-w-[120px] bg-fuchsia-950 backdrop-blur-sm";

  const debounced = debounce(() => {
    calculateCurrentTimePos();
  }, 500);

  return (
    <div
      className={cx(gradientCSS, "w-screen h-screen overflow-auto")}
      onScroll={debounced}
    >
      <Banner
        year={year}
        setYear={setYear}
        tixCount={tixCount}
        bandSetCount={bandSetCount}
        promptDelete={promptDelete}
      />
      <SelectDayButton
        festivalData={typedFestivalData}
        setSelectedDay={setSelectedDay}
        selectedDay={selectedDay}
      />
      <table style={{ tableLayout: "auto" }}>
        <TableHeader stages={stages} />
        <tbody>
          <tr>
            {stages.map((stage) => (
              <td>
                <div className="flex">
                  {/* Time column */}
                  {/* TODO, see if it's possible to get this sticky */}

                  {/* Stage columns */}
                  <div
                    key={stage}
                    className={stageFlexClass}
                    style={{ height: `${timelineHeight + 134}px` }} // huh?
                  >
                    {showCurrentTime && <CurrentTime pos={currentTimePos} />}

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
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Clashfinder;
