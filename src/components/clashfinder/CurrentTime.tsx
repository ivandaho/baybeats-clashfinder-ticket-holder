type CurrentTimeProps = {
  pixelsPerMinute: number;
  minTime: number;
};

const offset = -10; // huh ???

const CurrentTime = ({ pixelsPerMinute, minTime }: CurrentTimeProps) => {
  const d = new Date();
  let dHours = d.getHours();
  const dMinutes = d.getMinutes() + 5;
  const minutes = dHours * 60 + dMinutes;
  const pos = (minutes - minTime) * pixelsPerMinute + 60 + offset;

  if (pos < 0) return null;

  return (
    <div
      className="relative left-0 right-0 border-t border-white/50 flex justify-center z-10"
      style={{ top: `${pos}px`, height: 0 }}
    ></div>
  );
};

export { CurrentTime };
