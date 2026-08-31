import { useEffect, useState } from "react";
import { H4 } from "./H4";
const VERSION = "2.3.1";
const AUTH_URL = "/invite/testivan";

type BannerProps = {
  bandSetCount: number | null;
  promptDelete: () => Promise<void>;
  tixCount: number | null;
  setYear: (v: string) => void;
  year: string;
};

const Banner = ({
  bandSetCount,
  promptDelete,
  tixCount,
  year,
}: BannerProps) => {
  const [counter, setCounter] = useState(0);
  const [authStatus, setAuthStatus] = useState<string>("");
  const onClick = () => {
    setCounter(counter + 1);
  };

  const onAuth = async () => {
    try {
      const response = await fetch(AUTH_URL, { credentials: "include" });
      if (response.ok) {
        setAuthStatus("authenticated");
      } else {
        setAuthStatus(`failed (${response.status})`);
      }
    } catch (e) {
      setAuthStatus("error");
    }
  };

  useEffect(() => {
    if (counter >= 10) {
      // const newYear = year === "2026" ? "2025" : "2026";
      // setYear(newYear);
      alert(`version: ${VERSION}`);
      setCounter(0);
    }
  }, [counter]);

  return (
    <div className="pl-1">
      <h1 onClick={onClick} className="text-4xl font-bold text-white pt-2 flex">
        Baybeats {year} Clashfinder
      </h1>
      <H4>
        Ticket management: Click <strong>any</strong> band slot to start storing
        tickets for <strong>any</strong> set, only on this device.{" "}
        <strong>You may select tickets for multiple sets at once.</strong>
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
      </H4>
      <H4 className="*:p-1">
        <small className="text-right">v{VERSION}</small>
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
        <button
          onClick={onAuth}
          className="rounded-md font-semibold text-xs text-white content-center px-1 bg-white/10 hover:bg-white/20"
        >
          Auth {authStatus && `- ${authStatus}`}
        </button>
      </H4>
      {tixCount && tixCount > 0 ? (
        <H4
          onClick={(e) => {
            e.preventDefault();
            promptDelete();
          }}
          className="!text-red-500 my-2 text-[10px] cursor-pointer"
        >
          DELETE ALL DATA
        </H4>
      ) : null}
    </div>
  );
};

export { Banner };
