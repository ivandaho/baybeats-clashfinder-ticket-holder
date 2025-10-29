import type { TimeMarker } from "../../types/types";

type TimeMarkersProps = {
  markers: TimeMarker[];
};

const TimeMarkers = ({ markers }: TimeMarkersProps) => {
  return markers.map((marker) => {
    const { displayHour, period, isHour } = marker;
    return (
      <div
        key={marker.minutes}
        className="absolute left-0 right-0 border-t border-white/10 flex justify-center"
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
