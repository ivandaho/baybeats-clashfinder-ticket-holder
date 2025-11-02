import { useEffect, useState } from "react";
import { H4 } from "./H4";
const VERSION = "1.1";

type BannerProps = {
  bandSetCount: number | null;
  closeBanner: () => void;
  promptDelete: () => Promise<void>;
  tixCount: number | null;
};
const Banner = ({
  bandSetCount,
  closeBanner,
  promptDelete,
  tixCount,
}: BannerProps) => {
  const [counter, setCounter] = useState(0);

  const onClick = () => {
    setCounter(counter + 1);
  };

  useEffect(() => {
    if (counter >= 10) {
      alert(`version: ${VERSION}`);
      setCounter(0);
    }
  }, [counter]);

  return (
    <div className="pl-1">
      <h1 onClick={onClick} className="text-4xl font-bold text-white mt-4 flex">
        Baybeats 2025 Clashfinder
        <span
          onClick={closeBanner}
          className="p-2 text-[8px] h-20 w-20 text-center text-nowrap text-white/50 cursor-pointer"
        >
          close banner
        </span>
      </h1>
      <H4>
        Ticket management: Click <strong>any</strong> band slot to start storing
        tickets for <strong>any</strong> set, only on this device. You may
        select tickets for multiple sets at once.
      </H4>
      <H4>
        <strong>now supporting multiple pdf downloads.</strong>
      </H4>
      <H4>Everything runs locally, nothing is uploaded.</H4>
      <H4>Tickets required only for performances at Powerhouse and Annexe.</H4>
      <H4>
        You have stored <strong>{tixCount}</strong> tickets for{" "}
        <strong>{bandSetCount}</strong> sets.
      </H4>
      <H4>
        After storing tickets, click the slot to access your ticket(s) for that
        set.
        <a
          href="https://www.esplanade.com/baybeats"
          className="rounded-md font-semibold text-xs text-white content-center px-1"
        >
          Baybeats Website
        </a>
        <a
          href="https://github.com/ivandaho/baybeats-clashfinder-ticket-holder"
          className="rounded-md font-semibold text-xs text-white content-center px-1"
        >
          Code
        </a>
      </H4>
      {tixCount && tixCount > 0 ? (
        <H4
          onClick={(e) => {
            e.preventDefault();
            promptDelete();
          }}
          className="!text-red-500 mt-2 text-[10px] cursor-pointer"
        >
          DELETE ALL DATA
        </H4>
      ) : null}
    </div>
  );
};

export { Banner };
