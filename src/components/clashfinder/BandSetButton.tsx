import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { addMinutes, isNeedTix, timeToMinutes } from "../../utils/clashfinder";
import {
  getArtistSetTixCount,
  getPDFById,
  readFilesAsyncish,
  saveTixPerBand,
} from "../../utils/pdf";
import cx from "classnames";
import type { BaybeatsSet, BaybeatsStage } from "../../types/types";
import { TixBadge } from "./TixBadge";

const haveTixClass = "from-indigo-900";
const noTixClass = "from-pink-500";
const dontNeedTixClass = "from-blue-400";

type BandSetButtonProps = {
  baybeatsSet: BaybeatsSet;
  stage: BaybeatsStage;
  minTime: number;
  pixelsPerMinute: number;
  setBandSetCount: Dispatch<SetStateAction<number | null>>;
  setRefreshWorkaround: Dispatch<SetStateAction<number>>;
  refreshWorkaround: number;
};

const BandSetButton = ({
  baybeatsSet,
  minTime,
  stage,
  pixelsPerMinute,
  refreshWorkaround,
  setRefreshWorkaround,
  setBandSetCount,
}: BandSetButtonProps) => {
  const { startTime, artist, note } = baybeatsSet;
  const endTime = addMinutes(startTime, stage === "Concourse" ? 30 : 40);
  const startMinutes = timeToMinutes(startTime);
  const topPosition = (startMinutes - minTime) * pixelsPerMinute;
  const height = (stage === "Concourse" ? 30 : 40) * pixelsPerMinute; // 45 min set

  const inputRef = useRef<HTMLInputElement>(null);
  const [tixCount, setTixCount] = useState<number>(0);
  const [ticketBlobLink, setTicketBlobLink] = useState<string>("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    // const result = await consolidatePDFs(files);
    const result = await readFilesAsyncish(files);
    // console.log("result: ", result);
    const re = await saveTixPerBand(result);
    console.log("re: ", re);
    if (re) {
      setRefreshWorkaround(new Date().getTime());
    }
  };

  useEffect(() => {
    const initFn = async () => {
      const pdfBlobUrl = await getPDFById(artist);
      const url = pdfBlobUrl ? URL.createObjectURL(pdfBlobUrl) : "#";
      setTicketBlobLink(url);
      setTixCount(getArtistSetTixCount(artist));
    };
    initFn();
  }, [artist, refreshWorkaround]);

  const needTix = isNeedTix(stage);

  return (
    <>
      <a
        href={ticketBlobLink}
        target="_blank"
        onClick={(e) => {
          if (tixCount === 0) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cx(
          "absolute left-1 right-1 bg-gradient-to-br to-purple-600 rounded-lg px-2 py-1 overflow-hidden hover:scale-105 hover:z-10 transition-transform cursor-pointer shadow-lg flex flex-col min-h-16",
          needTix
            ? tixCount > 0
              ? haveTixClass
              : noTixClass
            : dontNeedTixClass,
        )}
        style={{
          top: `${topPosition}px`,
          height: `${height}px`,
        }}
      >
        <div className="text-white/80 font-bold text-[10px] mb-1">
          {startTime} - {endTime}
        </div>
        <div className="text-white font-semibold text-sm leading-tight grow">
          {artist}
        </div>
        {note && (
          <div className="text-white/80 text-xs italic leading-tight">
            {note}
          </div>
        )}
        {needTix && (
          <TixBadge
            setRefreshWorkaround={setRefreshWorkaround}
            setBandSetCount={setBandSetCount}
            tixCount={tixCount}
            setTixCount={setTixCount}
            artist={artist}
          />
        )}
      </a>
      <input
        hidden
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileChange}
      />
    </>
  );
};

export { BandSetButton };
