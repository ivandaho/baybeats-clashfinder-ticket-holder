import type { TimeMarker } from "../../types/types";

type TimeColumnProps = {
  markers: TimeMarker[];
};

const TimeColumn = ({ markers }: TimeColumnProps) => {
  return markers.map((marker) => {
    const { minutes, isHour, position, displayHour, period } = marker;
    return (
      <div
        key={minutes}
        className="absolute left-0 right-0 text-white text-sm font-semibold"
        style={{ top: `${position}px` }}
      >
        {isHour ? `${displayHour}${period}` : ""}
      </div>
    );
  });
};

export { TimeColumn };
