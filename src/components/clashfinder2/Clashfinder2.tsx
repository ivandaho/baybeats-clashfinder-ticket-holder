// import { useGetTimeRangeStuff } from "../clashfinder/useGetTimeRangeStuff";
import "./Clashfinder2.css";
import { festival_schedule as festivalData } from "../../schedule.json";
import type {
  BaybeatsDay,
  BaybeatsFestivalData,
  UniqTixCountFormat,
} from "../../types/types";
import { useEffect, useState } from "react";
import { getTodayBaybeatsDay } from "../../utils/clashfinder";
import { Grid } from "../grid/Grid";
import { getCellToBandMap } from "../../utils/grid";
import { Banner } from "../clashfinder/Banner";
import { migrateLegacyData, removeAllPDFData } from "../../utils/pdf";

const Clashfinder2 = () => {
  const typedFestivalData: BaybeatsFestivalData = festivalData;

  const todayBaybeatsDay = getTodayBaybeatsDay();
  const [selectedDay, setSelectedDay] = useState<BaybeatsDay>(todayBaybeatsDay);
  const [refreshWorkaround, setRefreshWorkaround] = useState<number>(0);
  const [bandSetCount, setBandSetCount] = useState<null | number>(null);
  const [tixCount, setTixCount] = useState<null | number>(null);
  const [isMigrating, setIsMigrating] = useState<boolean>(true);
  const [hideBanner, setHideBanner] = useState<boolean>(
    localStorage.getItem("hideBanner") === "hide",
  );

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

  const cellToBandMap = getCellToBandMap(selectedDay);

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

  const closeBanner = () => {
    localStorage.setItem("hideBanner", "hide");
    setHideBanner(true);
  };

  return (
    <div className="timetable-shell">
      <Banner
        bandSetCount={bandSetCount}
        closeBanner={closeBanner}
        tixCount={tixCount}
        promptDelete={promptDelete}
      />
      <div className="">
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
      <div className="stage-header">
        <div>Annexe</div>
        <div>Powerhouse</div>
        <div>Outdoor</div>
        <div>LiveWire</div>
        <div>Concourse</div>
      </div>
      <div className="timetable-scroll">
        <Grid
          cellToBandMap={cellToBandMap}
          refreshWorkaround={refreshWorkaround}
          setBandSetCount={setBandSetCount}
          setRefreshWorkaround={setRefreshWorkaround}
        />
      </div>
    </div>
  );
};
export { Clashfinder2 };
