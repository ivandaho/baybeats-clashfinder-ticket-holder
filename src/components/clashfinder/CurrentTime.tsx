type CurrentTimeProps = {
  pos: number;
};

const CurrentTime = ({ pos }: CurrentTimeProps) => {
  if (pos < 0) return null;

  return (
    <div
      className="relative left-0 right-0 border-t border-white/50 flex justify-center z-10"
      style={{ top: `${pos}px`, height: 0 }}
    ></div>
  );
};

export { CurrentTime };
