type CurrentTimeProps = {
  pixelsPerMinute: number;
  minTime: number;
};

const CurrentTime = ({ pixelsPerMinute, minTime }: CurrentTimeProps) => {
  const d = new Date();
  const minutes = d.getHours() * 60 + d.getMinutes();
  const pos = (minutes - minTime) * pixelsPerMinute;

  if (pos < 0) return null;

  let h = d.getHours();
  let ampm = "am";
  if (h > 12) {
    h -= 12;
    ampm = "pm";
  }

  return (
    <div
      className="relative left-0 right-0 border-t border-white/50 flex justify-center"
      style={{ top: `${pos}px`, height: 0 }}
    >
      {`${h}:${d.getMinutes()}${ampm}`}
    </div>
  );
};

export { CurrentTime };
