import { useState, type Dispatch, type SetStateAction } from "react";
import type { BaybeatsDay, BaybeatsFestivalData } from "../../types/types";
import cx from "../../utils/cx";

const buttonClass = `px-2 py-1 rounded-md font-semibold text-sm`;
const buttonClassSelected = "bg-white text-lime-600 scale-105";

type OpenButtonProps = {
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  selectedDay: BaybeatsDay;
  festivalData: BaybeatsFestivalData;
};

const OpenButton = (props: OpenButtonProps) => {
  const { setIsMenuOpen, selectedDay, festivalData } = props;

  return (
    <button
      onClick={() => setIsMenuOpen(true)}
      className={cx(buttonClassSelected, "p-1")}
    >
      {festivalData[selectedDay].date}
    </button>
  );
};

type SelectDayButtonProps = {
  // isMenuOpen: boolean;
  // setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  selectedDay: BaybeatsDay;
  festivalData: BaybeatsFestivalData;
  setSelectedDay: Dispatch<SetStateAction<BaybeatsDay>>;
};
const SelectDayButton = (props: SelectDayButtonProps) => {
  const { festivalData, setSelectedDay, selectedDay } = props;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);

  const onClick = (day: BaybeatsDay) => {
    if (day === selectedDay) {
      setIsMenuOpen(!isMenuOpen);
    }
    setSelectedDay(day);
    // setIsMenuOpen(false);
  };
  return (
    <div
      className={cx(
        "fixed flex flex-col bottom-4 right-4 z-99999 shadow-lg/40 transition-all rounded-lg bg-lime-800 border-1 border-lime-700",
      )}
    >
      {!isMenuOpen ? (
        <OpenButton
          festivalData={festivalData}
          setIsMenuOpen={setIsMenuOpen}
          selectedDay={selectedDay}
        />
      ) : (
        (Object.keys(festivalData) as BaybeatsDay[]).map((day) => (
          <button
            key={day}
            onClick={() => onClick(day)}
            className={cx(
              buttonClass,
              selectedDay === day
                ? buttonClassSelected
                : "text-white hover:bg-lime-700",
            )}
          >
            {festivalData[day].date}
          </button>
        ))
      )}
    </div>
  );
};
export { SelectDayButton };
