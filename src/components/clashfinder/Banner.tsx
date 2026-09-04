import { useEffect, useState } from "react";
import { H4 } from "./H4";
const VERSION = "2.4.1";

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
  const onClick = () => {
    setCounter(counter + 1);
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
        Baybeats {year} Clashfinder & Ticket Holder
      </h1>
      <H4>Ticket management:</H4>
      <H4>
        <strong>PDF files:</strong>
        <ul className="list-disc list-inside">
          <li>
            Click <strong>any</strong> band slot to upload PDF tickets for{" "}
            <strong>any</strong> set.
          </li>
          <li>You may select tickets for multiple sets at once.</li>{" "}
          <li>
            Either upload the original printed PDF ticket or the page(s) with
            the set info and barcode.
          </li>
        </ul>
      </H4>
      <H4>
        <strong>Images:</strong>
        <ul className="list-disc list-inside">
          <li>
            Click a <strong>specific</strong> band slot to store your{" "}
            <strong>single</strong> ticket for the <strong>specific</strong>{" "}
            set, only on this device.
          </li>
          <li>Stores a single image per set.</li>
        </ul>
      </H4>
      <H4>
        <strong>Everything runs locally, nothing is uploaded.</strong>
      </H4>
      <H4>Tickets required only for performances at Powerhouse and Annexe.</H4>
      <H4>
        You have stored <strong>{tixCount}</strong> tickets for{" "}
        <strong>{bandSetCount}</strong> sets.
      </H4>
      <H4>Click the band slot to access your stored ticket(s) for that set.</H4>
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
