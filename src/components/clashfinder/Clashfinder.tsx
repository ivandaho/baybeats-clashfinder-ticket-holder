import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import cx from "classnames";
import { BandSetButton } from "./BandSetButton";
import type {
  BaybeatsDay,
  BaybeatsFestivalData,
  BaybeatsStage,
  UniqTixCountFormat,
} from "../../types/types";
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
import { Banner } from "./Banner";

const typedFestivalData: BaybeatsFestivalData = festivalData;

const offset = -60; // huh ???
const mainBGColor = "bg-fuchsia-900";

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
    const dHours = d.getHours();
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
    // return;
    calculateCurrentTimePos();
  }, 1000);

  const closeBanner = () => {
    localStorage.setItem("hideBanner", "hide");
    setHideBanner(true);
  };

  const stageFlexClass =
    "flex-1 min-w-[120px] max-w-[240px] bg-fuchsia-950 backdrop-blur-sm";

  return (
    <div className="bg-gradient-to-br from-fuchsia-900 via-fuchsia-1000 to-fuchsia-1000 w-screen h-screen overflow-auto">
      <Banner
        tixCount={tixCount}
        bandSetCount={bandSetCount}
        promptDelete={promptDelete}
        closeBanner={closeBanner}
      />
      <ChangeDayButton
        setSelectedDay={setSelectedDay}
        selectedDay={selectedDay}
      />
      <table style={{ tableLayout: "auto" }}>
        <TableHeader stages={stages} />
        <tbody>
          <tr>
            <td>
              <div
                // onScroll={debounced}
                className="rounded-xl px-1 flex"
              >
                {/* Time column */}
                {/* TODO, see if it's possible to get this sticky */}

                {/* Stage columns */}
                {stages.map((stage) => (
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
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

type HeadeStuffProps = {
  stages: BaybeatsStage[];
};
const TableHeader = (props: HeadeStuffProps) => {
  const { stages } = props;
  const mainClasses = "sticky z-99999 w-screen top-0";
  return (
    <thead>
      <tr>
        <th className={cx(mainClasses)}>
          <div className="flex pl-1">
            {stages.map((stage) => (
              <div
                key={stage}
                className={cx(
                  "bg-fuchsia-950 text-white font-bold text-center p-2 border-b-2 border-white/30 text-nowrap truncate",
                  // mainClasses,
                  // TODO: this will break if stages < 5
                  "min-w-[120.5px] max-w-[240px]",
                  // "border border-dashed border-1 border-yellow-400"
                )}
              >
                {stage}
              </div>
            ))}
          </div>
        </th>
      </tr>
    </thead>
  );
};

const buttonClass = `px-2 py-1 rounded-md font-semibold text-sm`;
const buttonClassSelected = "bg-white text-purple-900 shadow-lg scale-105";

type ChangeDayButtonProps = {
  setSelectedDay: Dispatch<SetStateAction<BaybeatsDay>>;
  selectedDay: BaybeatsDay;
};
const ChangeDayButton = (props: ChangeDayButtonProps) => {
  const { setSelectedDay, selectedDay } = props;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const onClick = (day: BaybeatsDay) => {
    setSelectedDay(day);
    setIsMenuOpen(false);
  };

  return (
    <div
      className={cx(
        "fixed flex flex-col bottom-3 right-3 z-99999 shadow-lg transition-all",
        mainBGColor,
      )}
    >
      {!isMenuOpen ? (
        <button
          onClick={() => setIsMenuOpen(true)}
          className={cx(buttonClassSelected, buttonClassSelected)}
        >
          {typedFestivalData[selectedDay].date}
        </button>
      ) : (
        (Object.keys(typedFestivalData) as BaybeatsDay[]).map((day) => (
          <button
            key={day}
            onClick={() => onClick(day)}
            className={cx(
              buttonClass,
              selectedDay === day
                ? buttonClassSelected
                : "text-white hover:bg-purple-700",
            )}
          >
            {typedFestivalData[day].date}
          </button>
        ))
      )}
    </div>
  );
};

export default Clashfinder;
