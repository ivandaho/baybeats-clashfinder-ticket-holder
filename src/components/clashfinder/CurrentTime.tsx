import { useEffect, useState } from "react";

type CurrentTimeProps = {
  pixelsPerMinute: number;
  minTime: number;
};

const offset = -10; // huh ???

const CurrentTime = ({ pixelsPerMinute, minTime }: CurrentTimeProps) => {
  let interval: number;

  const [pos, setPos] = useState(-1);

  const calculatePos = () => {
    const d = new Date();
    let dHours = d.getHours();
    const dMinutes = d.getMinutes() + 5;
    const minutes = dHours * 60 + dMinutes;
    const newPos = (minutes - minTime) * pixelsPerMinute + 60 + offset;
    setPos(newPos);
  };

  useEffect(() => {
    calculatePos();
    interval = setInterval(
      () => {
        calculatePos();
      },
      1000 * 60 * 60 * 5, // every 5 minutes
    );
    return () => {
      clearTimeout(interval);
    };
  }, []);

  if (pos < 0) return null;

  return (
    <div
      className="relative left-0 right-0 border-t border-white/50 flex justify-center z-10"
      style={{ top: `${pos}px`, height: 0 }}
    ></div>
  );
};

export { CurrentTime };
