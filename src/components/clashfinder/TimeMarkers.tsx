import type { TimeMarker } from "../../types/types";
import cx from "../../utils/cx";

const hourBorder = "border-white/10";
const halfHourBorder = "border-dashed border-white/10";

type TimeMarkersProps = {
  markers: TimeMarker[];
};

const TimeMarkers = ({ markers }: TimeMarkersProps) => {
  return markers.map((marker) => {
    const { displayHour, period, isHour } = marker;
    return (
      <div
        key={marker.minutes}
        className={cx(
          "absolute left-0 right-0 border-t flex justify-center",
          isHour ? hourBorder : halfHourBorder,
        )}
        style={{ top: `${marker.position}px` }}
      >
        <span className="absolute top-[-0.5rem] self-center text-xs opacity-25">
          {`${displayHour}${isHour ? "" : ":30"}${period}`}
        </span>
      </div>
    );
  });
};

export { TimeMarkers };
